import * as anchor from "@project-serum/anchor";
import { NftWalletBridge } from "../../data/idl/nftwalletbridge";
import * as Idl from "../../data/idl/nftwalletbridge.json";

export default async function fetchDataFromLinkedNft(
  nftMintAddress: anchor.web3.PublicKey,
  wallet: any,
  connection: any,
  setNFTData: (arg0: Array<{ name: string; url: string }>) => void
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
    setNFTData(result);
  }
}
