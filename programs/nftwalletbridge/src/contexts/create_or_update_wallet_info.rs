use anchor_lang::{prelude::*};
use anchor_spl::token::{TokenAccount, Mint};

use crate::{states::{MintPdaState, WalletPdaState}, error::CustomError};

#[derive(Accounts)]
pub struct CreateOrUpdateWalletInfo<'info> {
	#[account(mut)]
	pub initializer: Signer<'info>,
	pub mint: Account<'info, Mint>,
	#[account(
		constraint = associated_mint_address.mint.key() == mint.key() @CustomError::MintDoesNotMatch,
	)]
	pub associated_mint_address: Account<'info, TokenAccount>,
	#[account(
		mut,
		seeds = [mint_pda_account.linked_address.unwrap().key().as_ref()],
		bump,
		constraint = mint_pda_account.is_initialized == true @CustomError::MintPdaAccountNotYetInitialized,
		constraint = previous_wallet_pda_account.linked_nfts.contains(&mint.key()) @CustomError::DataDoesNotExist,
	)]
	pub previous_wallet_pda_account: Option<Account<'info, WalletPdaState>>,
	#[account(
		init_if_needed, 
		seeds = [initializer.key().as_ref()],
		bump,
		payer = initializer,
		space = 8 + 32 + 4 + 32*6, // only allow up to 6 linked nfts per wallet
		constraint = new_wallet_pda_account.linked_nfts.len() < 6 @CustomError::NumberOfNFTExceededOverallAlloowableAmount,
	)]
	pub new_wallet_pda_account: Account<'info, WalletPdaState>,
	#[account(
		init_if_needed,
		seeds = [mint.key().as_ref()],
		bump,
		payer = initializer,
		space = 8 + 1 + 32 + 1 + 32 + 4 + 32*25, // only allow maximum of 25 data account to link to nft
		constraint = associated_mint_address.owner == *initializer.key @CustomError::InitializerNotOwnerOfMint,
		constraint = associated_mint_address.amount == 1 @CustomError::InitializerNotOwnerOfMint,
	)]
	pub mint_pda_account: Account<'info, MintPdaState>,
	pub system_program: Program<'info, System>,
}