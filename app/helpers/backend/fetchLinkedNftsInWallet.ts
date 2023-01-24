import * as anchor from "@project-serum/anchor";
import { Nft } from "@metaplex-foundation/js";
import * as Idl from "../../data/idl/nftwalletbridge.json";
import { NftWalletBridge } from "../../data/idl/nftwalletbridge";
import { clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export default async function fetchLinkedNftsInWallet(pubkey: PublicKey) {
  const wallet = new anchor.Wallet(
    Keypair.fromSecretKey(bs58.decode(process.env.PROGRAM_KEY!))
  );
  const connection = new anchor.web3.Connection(
    clusterApiUrl(WalletAdapterNetwork.Devnet)
  );
  try {
    if (wallet != null) {
      const program = new anchor.Program<NftWalletBridge>(
        Idl as NftWalletBridge,
        new anchor.web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!),
        new anchor.AnchorProvider(
          connection,
          wallet,
          anchor.AnchorProvider.defaultOptions()
        )
      );
      let walletPdaAccount = anchor.web3.PublicKey.findProgramAddressSync(
        [pubkey.toBuffer()],
        program.programId
      )[0];
      let walletData = await program.account.walletPdaState.fetch(
        walletPdaAccount
      );
      return walletData.linkedNfts;
    }
  } catch (error) {
    console.log(error);
  }
}
