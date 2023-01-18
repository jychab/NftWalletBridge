import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Connection } from "@solana/web3.js";
import { NftWalletBridge } from "../idl/nftwalletbridge";
import * as Idl from "../idl/nftwalletbridge.json";
import getOrCreateATA from "./getOrCreateATA";

export default async function addOrUpdateNftLinksToWallet(
  wallet: AnchorWallet,
  connection: Connection,
  nftMintKey: PublicKey
) {
  const program = new anchor.Program<NftWalletBridge>(
    Idl as NftWalletBridge,
    new anchor.web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!),
    new anchor.AnchorProvider(
      connection,
      wallet,
      anchor.AnchorProvider.defaultOptions()
    )
  );
  let associatedTokenAddress = await getOrCreateATA(
    connection,
    nftMintKey,
    wallet
  );
  let newWalletPdaAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer()],
    program.programId
  )[0];
  let mintPdaAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [nftMintKey.toBuffer()],
    program.programId
  )[0];
  let previousWalletPdaAccount = null;
  try {
    let existingMintPdaAccount = await program.account.mintPdaState.fetch(
      mintPdaAccount
    );
    if (existingMintPdaAccount.linkedAddress != null) {
      previousWalletPdaAccount = anchor.web3.PublicKey.findProgramAddressSync(
        [existingMintPdaAccount.linkedAddress.toBuffer()],
        program.programId
      )[0];
    }
  } catch {
    console.log("NFT hasn't been linked before");
  }
  let ix = null;
  try {
    ix = await program.methods
      .createOrUpdateWalletInfoFromMintAccount()
      .accounts({
        mint: nftMintKey,
        initializer: wallet.publicKey,
        associatedMintAddress: associatedTokenAddress.address,
        newWalletPdaAccount: newWalletPdaAccount,
        previousWalletPdaAccount: previousWalletPdaAccount,
        mintPdaAccount: mintPdaAccount,
      })
      .rpc();
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: ix,
    });
  } catch (err) {
    console.log(err);
  } finally {
    return ix;
  }
}
