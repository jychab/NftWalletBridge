import * as anchor from "@project-serum/anchor";
import { NftWalletBridge } from "../../data/idl/nftwalletbridge";
import * as Idl from "../../data/idl/nftwalletbridge.json";

export default async function removeLinkedNftFromWallet(
  nft: anchor.web3.PublicKey,
  wallet: any,
  connection: any
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
    [nft.toBuffer()],
    program.programId
  )[0];
  let walletPdaAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer()],
    program.programId
  )[0];
  let tx = null;
  try {
    tx = await program.methods
      .removeWalletInfoFromMintAccount()
      .accounts({
        initializer: wallet.publicKey,
        currentWalletPdaAccount: walletPdaAccount,
        mintPdaAccount: mintPdaAccount,
      })
      .rpc();
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: tx,
    });
  } catch (err) {
    console.log(err);
  } finally {
    return tx;
  }
}
