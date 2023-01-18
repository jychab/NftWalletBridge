import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Nftwalletbridge } from "../target/types/nftwalletbridge";
import { PublicKey } from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { beforeEach } from "mocha";
import { assert } from "chai";

describe("nftwalletbridge", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.Nftwalletbridge as Program<Nftwalletbridge>;

  let nftMint: PublicKey;
  let initializerNftMintAccount: PublicKey;
  let previousWalletPdaAccount: PublicKey;
  let newWalletPdaAccount: PublicKey;

  const initializerWallet = anchor.web3.Keypair.generate();
  const initializerWallet_2 = anchor.web3.Keypair.generate();

  beforeEach("Creating test accounts!", async () => {
    //airdrop to initializerWallet
    const airdropInitializerSig = await provider.connection.requestAirdrop(
      initializerWallet.publicKey,
      2e9
    );

    const latestInitializerBlockhash =
      await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction({
      blockhash: latestInitializerBlockhash.blockhash,
      lastValidBlockHeight: latestInitializerBlockhash.lastValidBlockHeight,
      signature: airdropInitializerSig,
    });

    //airdrop to intializerWallet2
    const airdropInitializerWallet2Sig =
      await provider.connection.requestAirdrop(
        initializerWallet_2.publicKey,
        2e9
      );

    const latestInitializerWallet2Blockhash =
      await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction({
      blockhash: latestInitializerWallet2Blockhash.blockhash,
      lastValidBlockHeight:
        latestInitializerWallet2Blockhash.lastValidBlockHeight,
      signature: airdropInitializerWallet2Sig,
    });

    //create mint for initializer wallet
    nftMint = await spl.createMint(
      provider.connection,
      initializerWallet,
      initializerWallet.publicKey,
      initializerWallet.publicKey,
      0
    );
    initializerNftMintAccount = await spl.createAccount(
      provider.connection,
      initializerWallet,
      nftMint,
      initializerWallet.publicKey
    );
    await spl.mintTo(
      provider.connection,
      initializerWallet,
      nftMint,
      initializerNftMintAccount,
      initializerWallet,
      1
    );
  });

  it("Link wallet to nft, then remove the link with the nft", async () => {
    //link nft to wallet
    newWalletPdaAccount = publicKey.findProgramAddressSync(
      [initializerWallet.publicKey.toBuffer()],
      program.programId
    )[0];
    let mintPdaAccount = publicKey.findProgramAddressSync(
      [nftMint.toBuffer()],
      program.programId
    )[0];

    let associatedTokenAddress = spl.getAssociatedTokenAddressSync(
      nftMint,
      initializerWallet.publicKey
    );

    await program.methods
      .createOrUpdateAccount()
      .accounts({
        mint: nftMint,
        initializer: initializerWallet.publicKey,
        associatedMintAddress: associatedTokenAddress,
        newWalletPdaAccount: newWalletPdaAccount,
        previousWalletPdaAccount: null,
        mintPdaAccount: mintPdaAccount,
      })
      .signers([initializerWallet])
      .rpc();
    let dataObject = await program.account.mintPdaState.fetch(mintPdaAccount);
    assert.equal(dataObject.isInitialized, true);
    assert.equal(
      dataObject.linkedAddress.toString(),
      initializerWallet.publicKey.toString()
    );
    assert.equal(dataObject.mintAddress.toString(), nftMint.toString());
    assert.equal(
      dataObject.linkedAccountAddress.toString(),
      newWalletPdaAccount.toString()
    );

    let walletObject = await program.account.walletPdaState.fetch(
      newWalletPdaAccount
    );
    assert.equal(
      walletObject.linkedNfts
        .map((pubKey) => pubKey.toString())
        .includes(nftMint.toString()),
      true
    );
    //remove linkage of nft with wallet
    await program.methods
      .removeAccount()
      .accounts({
        initializer: initializerWallet.publicKey,
        mintPdaAccount: mintPdaAccount,
        currentWalletPdaAccount: newWalletPdaAccount,
      })
      .signers([initializerWallet])
      .rpc();
  });

  it("Link wallet to nft, transfer nft to another wallet, then link nft with the new wallet", async () => {
    //link nft to walllet
    newWalletPdaAccount = publicKey.findProgramAddressSync(
      [initializerWallet.publicKey.toBuffer()],
      program.programId
    )[0];
    let mintPdaAccount = publicKey.findProgramAddressSync(
      [nftMint.toBuffer()],
      program.programId
    )[0];

    let associatedTokenAddress = spl.getAssociatedTokenAddressSync(
      nftMint,
      initializerWallet.publicKey
    );
    await program.methods
      .createOrUpdateAccount()
      .accounts({
        mint: nftMint,
        initializer: initializerWallet.publicKey,
        associatedMintAddress: associatedTokenAddress,
        newWalletPdaAccount: newWalletPdaAccount,
        previousWalletPdaAccount: null,
        mintPdaAccount: mintPdaAccount,
      })
      .signers([initializerWallet])
      .rpc();
    let dataObject = await program.account.mintPdaState.fetch(mintPdaAccount);
    assert.equal(dataObject.isInitialized, true);
    assert.equal(
      dataObject.linkedAddress.toString(),
      initializerWallet.publicKey.toString()
    );
    assert.equal(dataObject.mintAddress.toString(), nftMint.toString());
    assert.equal(
      dataObject.linkedAccountAddress.toString(),
      newWalletPdaAccount.toString()
    );

    let walletObject = await program.account.walletPdaState.fetch(
      newWalletPdaAccount
    );
    assert.equal(
      walletObject.linkedNfts
        .map((pubKey) => pubKey.toString())
        .includes(nftMint.toString()),
      true
    );
    // transfer nft to another wallet
    associatedTokenAddress = (
      await spl.getOrCreateAssociatedTokenAccount(
        provider.connection,
        initializerWallet_2,
        nftMint,
        initializerWallet_2.publicKey
      )
    ).address;
    await spl.transfer(
      provider.connection,
      initializerWallet,
      initializerNftMintAccount,
      associatedTokenAddress,
      initializerWallet,
      1
    );
    //link nft with the new wallet
    previousWalletPdaAccount = publicKey.findProgramAddressSync(
      [initializerWallet.publicKey.toBuffer()],
      program.programId
    )[0];
    newWalletPdaAccount = publicKey.findProgramAddressSync(
      [initializerWallet_2.publicKey.toBuffer()],
      program.programId
    )[0];

    mintPdaAccount = publicKey.findProgramAddressSync(
      [nftMint.toBuffer()],
      program.programId
    )[0];

    await program.methods
      .createOrUpdateAccount()
      .accounts({
        mint: nftMint,
        previousWalletPdaAccount: previousWalletPdaAccount,
        newWalletPdaAccount: newWalletPdaAccount,
        initializer: initializerWallet_2.publicKey,
        mintPdaAccount: mintPdaAccount,
        associatedMintAddress: associatedTokenAddress,
      })
      .signers([initializerWallet_2])
      .rpc();

    dataObject = await program.account.mintPdaState.fetch(mintPdaAccount);
    assert.equal(dataObject.isInitialized, true);
    assert.equal(
      dataObject.linkedAddress.toString(),
      initializerWallet_2.publicKey.toString()
    );
    assert.equal(dataObject.mintAddress.toString(), nftMint.toString());
    assert.equal(
      dataObject.linkedAccountAddress.toString(),
      newWalletPdaAccount.toString()
    );

    let previousWalletObject = await program.account.walletPdaState.fetch(
      previousWalletPdaAccount
    );
    assert.equal(
      previousWalletObject.linkedNfts
        .map((pubKey) => pubKey.toString())
        .includes(nftMint.toString()),
      false
    );

    let newWalletObject = await program.account.walletPdaState.fetch(
      newWalletPdaAccount
    );
    assert.equal(
      newWalletObject.linkedNfts
        .map((pubKey) => pubKey.toString())
        .includes(nftMint.toString()),
      true
    );
  });

  it("Link wallet to nft, add, update and remove content from the nft", async () => {
    //link nft to wallet
    newWalletPdaAccount = publicKey.findProgramAddressSync(
      [initializerWallet.publicKey.toBuffer()],
      program.programId
    )[0];
    let mintPdaAccount = publicKey.findProgramAddressSync(
      [nftMint.toBuffer()],
      program.programId
    )[0];

    let associatedTokenAddress = spl.getAssociatedTokenAddressSync(
      nftMint,
      initializerWallet.publicKey
    );

    await program.methods
      .createOrUpdateAccount()
      .accounts({
        mint: nftMint,
        initializer: initializerWallet.publicKey,
        associatedMintAddress: associatedTokenAddress,
        newWalletPdaAccount: newWalletPdaAccount,
        previousWalletPdaAccount: null,
        mintPdaAccount: mintPdaAccount,
      })
      .signers([initializerWallet])
      .rpc();
    let mintObject = await program.account.mintPdaState.fetch(mintPdaAccount);
    assert.equal(mintObject.isInitialized, true);
    assert.equal(
      mintObject.linkedAddress.toString(),
      initializerWallet.publicKey.toString()
    );
    assert.equal(mintObject.mintAddress.toString(), nftMint.toString());
    assert.equal(
      mintObject.linkedAccountAddress.toString(),
      newWalletPdaAccount.toString()
    );

    let walletObject = await program.account.walletPdaState.fetch(
      newWalletPdaAccount
    );
    assert.equal(
      walletObject.linkedNfts
        .map((pubKey) => pubKey.toString())
        .includes(nftMint.toString()),
      true
    );
    //write content to the nft
    let mintPdaDataAccount = publicKey.findProgramAddressSync(
      [nftMint.toBuffer(), initializerWallet.publicKey.toBuffer()],
      program.programId
    )[0];
    await program.methods
      .addOrUpdateContentToAccount("www.helloworld.com")
      .accounts({
        initializer: initializerWallet.publicKey,
        mintPdaAccount: mintPdaAccount,
        mintPdaDataAccount: mintPdaDataAccount,
      })
      .signers([initializerWallet])
      .rpc();
    let data = await program.account.dataPdaState.fetch(mintPdaDataAccount);
    assert.equal(data.url, "www.helloworld.com");
    await program.methods
      .addOrUpdateContentToAccount("www.hellokitty.com")
      .accounts({
        initializer: initializerWallet.publicKey,
        mintPdaAccount: mintPdaAccount,
        mintPdaDataAccount: mintPdaDataAccount,
      })
      .signers([initializerWallet])
      .rpc();
    data = await program.account.dataPdaState.fetch(mintPdaDataAccount);
    assert.equal(data.url, "www.hellokitty.com");
    mintObject = await program.account.mintPdaState.fetch(mintPdaAccount);
    assert.equal(
      mintObject.linkedData
        .map((pubKey) => pubKey.toString())
        .includes(mintPdaDataAccount.toString()),
      true
    );
    await program.methods
      .removeContentFromAccount(initializerWallet.publicKey)
      .accounts({
        initializer: initializerWallet.publicKey,
        mintPdaAccount: mintPdaAccount,
        mintPdaDataAccount: mintPdaDataAccount,
      })
      .signers([initializerWallet])
      .rpc();
    mintObject = await program.account.mintPdaState.fetch(mintPdaAccount);
    assert.equal(
      mintObject.linkedData
        .map((pubKey) => pubKey.toString())
        .includes(mintPdaDataAccount.toString()),
      false
    );
  });
});
