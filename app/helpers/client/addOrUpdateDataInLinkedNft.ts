import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Connection } from "@solana/web3.js";
import { NftWalletBridge } from "../../data/idl/nftwalletbridge";
import * as Idl from "../../data/idl/nftwalletbridge.json";
import removeDataInLinkedNft from "./removeDataInLinkedNft";

export default async function addOrUpdateDataInLinkedNft(
  name: string,
  url: string,
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

  let mintPdaAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [nftMintKey.toBuffer()],
    program.programId
  )[0];

  let mintPdaDataAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [nftMintKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  )[0];

  let ix = null;
  try {
    try {
      ix = await program.methods
        .addContentToMintAccount(name, url)
        .accounts({
          initializer: wallet.publicKey,
          mintPdaAccount: mintPdaAccount,
          mintPdaDataAccount: mintPdaDataAccount,
        })
        .rpc();
    } catch {
      await removeDataInLinkedNft(
        wallet,
        mintPdaAccount,
        mintPdaDataAccount,
        connection
      );
      ix = await program.methods
        .addContentToMintAccount(name, url)
        .accounts({
          initializer: wallet.publicKey,
          mintPdaAccount: mintPdaAccount,
          mintPdaDataAccount: mintPdaDataAccount,
        })
        .rpc();
    }

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
