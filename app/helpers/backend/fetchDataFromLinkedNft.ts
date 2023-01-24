import * as anchor from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Keypair, clusterApiUrl } from "@solana/web3.js";
import { NftWalletBridge } from "../../data/idl/nftwalletbridge";
import * as Idl from "../../data/idl/nftwalletbridge.json";

export default async function fetchDataFromLinkedNft(
  nftMintAddress: anchor.web3.PublicKey
) {
  const wallet = new anchor.Wallet(
    Keypair.fromSecretKey(bs58.decode(process.env.PROGRAM_KEY!))
  );
  const connection = new anchor.web3.Connection(
    clusterApiUrl(WalletAdapterNetwork.Devnet)
  );
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
    [nftMintAddress.toBuffer()],
    program.programId
  )[0];

  let result: Array<{ name: string; url: string }> = [];
  try {
    const listOfNftData = await program.account.mintPdaState.fetch(
      mintPdaAccount
    );
    await Promise.all(
      listOfNftData.linkedData.map(async (dataKey) => {
        const mintPdaDataAccount = anchor.web3.PublicKey.findProgramAddressSync(
          [nftMintAddress.toBuffer(), dataKey.toBuffer()],
          program.programId
        )[0];
        result.push(
          await program.account.dataPdaState.fetch(mintPdaDataAccount)
        );
      })
    );
  } catch (err) {
    console.log(err);
  } finally {
    return result;
  }
}
