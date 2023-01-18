use anchor_lang::{prelude::*};

use crate::{states::{MintPdaState, WalletPdaState}, error::CustomError};

#[derive(Accounts)]
pub struct RemoveWalletInfo<'info> {
	#[account(mut)]
	pub initializer: Signer<'info>,
	#[account(
		mut,
		seeds = [mint_pda_account.linked_address.unwrap().key().as_ref()],
		bump,
		constraint = mint_pda_account.is_initialized == true @CustomError::MintPdaAccountNotYetInitialized,
		constraint = current_wallet_pda_account.linked_nfts.contains(&mint_pda_account.mint_address.key()) @CustomError::DataDoesNotExist,
	)]
	pub current_wallet_pda_account: Account<'info, WalletPdaState>,
	#[account(
		mut,
		constraint = mint_pda_account.linked_address.unwrap() == initializer.key() @CustomError::InitializerNotOwnerOfMint, 
	)]
	pub mint_pda_account: Account<'info, MintPdaState>,
}
