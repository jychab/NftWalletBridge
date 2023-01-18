import * as anchor from "@project-serum/anchor";
import { LinkedNfts } from "../idl/linkedNfts";
import * as Idl from "../idl/linkedNfts.json";

export async function fetchDataFromLinkedNft(
  nftMintAddress: anchor.web3.PublicKey,
  wallet: any,
  connection: any,
  setNFTData: (arg0: Array<{ name: string; url: string }>) => void
) {
  const program = new anchor.Program<LinkedNfts>(
    Idl as LinkedNfts,
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
