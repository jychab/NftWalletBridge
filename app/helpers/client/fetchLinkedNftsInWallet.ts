import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Nft } from "@metaplex-foundation/js";
import * as Idl from "../../data/idl/nftwalletbridge.json";
import { NftWalletBridge } from "../../data/idl/nftwalletbridge";

export default async function fetchLinkedNftsInWallet(
  setNfts: (arg0: Array<Nft | null>) => void,
  wallet: AnchorWallet,
  connection: any,
  metaplex: any
) {
  let nftData: Array<Nft | null> = [null, null, null, null, null, null];
  try {
    if (wallet != null && metaplex != null) {
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
        [wallet.publicKey.toBuffer()],
        program.programId
      )[0];
      let walletData = await program.account.walletPdaState.fetch(
        walletPdaAccount
      );

      await Promise.all(
        walletData.linkedNfts.map(async (nft, index) => {
          console.log(nft.toString());
          nftData[index] = await (metaplex as any)
            .nfts()
            .findByMint({ mintAddress: nft });
        })
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    setNfts(nftData);
  }
}
