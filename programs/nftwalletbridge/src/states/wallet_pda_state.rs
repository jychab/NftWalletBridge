use anchor_lang::{prelude::*};


#[account]
pub struct WalletPdaState {
    pub owner: Pubkey,
    pub linked_nfts: Vec<Pubkey>
}