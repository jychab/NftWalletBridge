use anchor_lang::{prelude::*, solana_program};
use solana_program::{
    program_pack::{IsInitialized},
};

#[account]
pub struct MintPdaState {
    pub is_initialized: bool,
    pub mint_address: Pubkey,
    pub linked_address: Option<Pubkey>,
    pub linked_data: Vec<Pubkey>,
}

impl IsInitialized for MintPdaState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}