import { Nft, Metadata } from "@metaplex-foundation/js";

export default async function fetchAllNftsInWallet(
  setNftsInWallet: (arg0: Array<Nft>) => void,
  metaplex: any
) {
  if (metaplex != null) {
    let myNfts: Array<Metadata> = await metaplex
      .nfts()
      .findAllByOwner({ owner: metaplex.identity().publicKey });

    let nftArray: Array<Nft> = await Promise.all(
      myNfts.map(async (metadata) => {
        let nft = await metaplex.nfts().load({ metadata });
        return nft;
      })
    );
    setNftsInWallet(nftArray);
  }
}
