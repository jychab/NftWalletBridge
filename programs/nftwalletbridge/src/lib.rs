pub mod contexts;
pub mod instructions;
pub mod states;
pub mod error;

use anchor_lang::prelude::*;

pub use contexts::*;

declare_id!("CcyvqjwZWKsQuLXjdKsx3BA7BqnAKonrXdZVMDPy7pXG");

#[program]
pub mod nftwalletbridge {
    use super::*;

    pub fn create_or_update_wallet_info_from_mint_account(ctx: Context<CreateOrUpdateWalletInfo>) -> Result<()>{
        instructions::create_or_update_wallet_info(ctx)
    }

    pub fn remove_wallet_info_from_mint_account(ctx: Context<RemoveWalletInfo>) -> Result<()>{
        instructions::remove_wallet_info(ctx)
    }

    pub fn add_content_to_mint_account(ctx: Context<AddContent>,name:String, url: String) -> Result<()> {
        instructions::add_content(ctx, name, url)
    }

    pub fn remove_content_from_mint_account(ctx: Context<RemoveContent>, key_to_remove: Pubkey) -> Result<()> {
        instructions::remove_content(ctx, key_to_remove)
    }

    pub fn update_linked_nfts_ordering_from_wallet_account(ctx: Context<UpdateLinkedNFtsOrder>, linked_nfts: Vec<Pubkey>) -> Result<()> {
        instructions::update_linked_nfts_order(ctx, linked_nfts)
    }
}
