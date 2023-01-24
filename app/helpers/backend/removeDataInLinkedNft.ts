import * as anchor from "@project-serum/anchor";
import * as Idl from "../../data/idl/nftwalletbridge.json";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { NftWalletBridge } from "../../data/idl/nftwalletbridge";

export default async function removeDataInLinkedNft(
  wallet: AnchorWallet,
  mintPdaAccount: anchor.web3.PublicKey,
  mintPdaDataAccount: anchor.web3.PublicKey,
  connection: anchor.web3.Connection
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
  let ix = await program.methods
    .removeContentFromMintAccount(wallet.publicKey)
    .accounts({
      initializer: wallet.publicKey,
      mintPdaAccount: mintPdaAccount,
      mintPdaDataAccount: mintPdaDataAccount,
    })
    .rpc();
  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: ix,
  });
  return ix;
}
