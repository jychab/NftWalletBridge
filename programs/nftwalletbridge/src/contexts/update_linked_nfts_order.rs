use anchor_lang::{prelude::*};

use crate::{states::{WalletPdaState}, error::CustomError};

#[derive(Accounts)]
#[instruction(linked_nfts: Vec<Pubkey>)]
pub struct UpdateLinkedNFtsOrder<'info> {
	#[account(mut)]
	pub initializer: Signer<'info>,
	#[account(
		mut,
		constraint = current_wallet_pda_account.owner == initializer.key() @CustomError::InitializerNotOwnerOfWallet,
		constraint = current_wallet_pda_account.clone().linked_nfts.sort() == linked_nfts.clone().sort() @CustomError::DataDoesNotExist,
	)]
	pub current_wallet_pda_account: Account<'info, WalletPdaState>,
}
