use anchor_lang::{prelude::*};

use crate::{states::{MintPdaState, DataPdaState}, error::CustomError};

#[derive(Accounts)]
#[instruction(key_to_remove:Pubkey)]
pub struct RemoveContent<'info> {
	#[account(mut)]
	pub initializer: Signer<'info>,
	#[account(
		mut,
		constraint = mint_pda_account.linked_data.contains(&key_to_remove) @CustomError::DataDoesNotExist,
	)]
	pub mint_pda_account: Account<'info, MintPdaState>,
	#[account(
		mut,
		seeds =  [mint_pda_account.mint_address.key().as_ref(),initializer.key().as_ref()],
		bump,
	)]
	pub mint_pda_data_account: Account<'info, DataPdaState>
}