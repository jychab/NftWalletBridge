# NftWalletBridge

Using a wallet address to reward on-chain participation through airdrops is too limiting.

Rewarding participation through NFTs is arguably much better because

1. The rewards are tied to something tradable
2. Allow for unique rewards depending on the various NFT held in a wallet.

## But most users are using burners, so how do we know what NFTs are linked to the wallet?

A bridge is needed to allow users to link their nft to a wallet of choice.

Users can transfer their nft to a burner wallet to initiate a link and then transfer the nft back to their safe ledger.

Once a link is active, DApps can easily fetch the linked NFTs from a given wallet address.

## So how do we distribute rewards to the NFTs?

When a link is made between a wallet and an NFT for the first time, a PDA tied to the NFT is created.

This PDA stores various information such as the current linked wallet address as well as a list of metadata PDAs linked to the NFT.

A metadata PDA can be created by anyone and it stores an off-chain url link that can be updated by the creator of the metadata PDA.

With this, DApps can fetch the linked NFTs for a particular wallet then add an off-chain url containing their metadata to the linked NFTs.

## What happens when I sell/transfer my NFTs?

Note that the PDA data is tied to the NFT and not the burner wallet.

When a new wallet initiates a link with the NFT, the link to the NFT data will be removed from the previous wallet and transfered to the new wallet.

# DEMO APP

A demo app configured for devnet is available at https://nft-wallet-bridge.vercel.app/
