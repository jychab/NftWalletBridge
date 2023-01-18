import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as spl from "@solana/spl-token";

export async function getOrCreateATA(
  connection: anchor.web3.Connection,
  nftMintKey: anchor.web3.PublicKey,
  wallet: AnchorWallet
) {
  let associatedTokenAddress;

  try {
    associatedTokenAddress = await spl.getAccount(
      connection,
      spl.getAssociatedTokenAddressSync(nftMintKey, wallet.publicKey)
    );
  } catch {
    let associatedTokenAddressInstruction =
      spl.createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        spl.getAssociatedTokenAddressSync(nftMintKey, wallet.publicKey),
        nftMintKey,
        wallet.publicKey
      );
    let recentBlockhash = await connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction();
    tx.recentBlockhash = recentBlockhash.blockhash;
    tx.feePayer = wallet.publicKey;
    tx.add(associatedTokenAddressInstruction);
    let signedTx = await wallet.signTransaction(tx);
    await connection.sendRawTransaction(signedTx.serialize());

    associatedTokenAddress = await spl.getAccount(
      connection,
      spl.getAssociatedTokenAddressSync(nftMintKey, wallet.publicKey)
    );
  }
  return associatedTokenAddress;
}
