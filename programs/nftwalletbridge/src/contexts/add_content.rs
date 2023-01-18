use anchor_lang::{prelude::*};

use crate::{states::{MintPdaState, DataPdaState}};

#[derive(Accounts)]
#[instruction(name: String, url: String)]
pub struct AddContent<'info> {
	#[account(mut)]
	pub initializer: Signer<'info>,
	#[account(mut)]
	pub mint_pda_account: Account<'info, MintPdaState>,
	#[account(
		init,
		seeds =  [mint_pda_account.mint_address.key().as_ref(),initializer.key().as_ref()],
		bump,
		payer = initializer,
		space = 8 + 4 + name.len() + 4 + url.len(),
	)]
	pub mint_pda_data_account: Account<'info, DataPdaState>,
	pub system_program: Program<'info, System>,
}