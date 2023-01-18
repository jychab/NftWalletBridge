use anchor_lang::{prelude::*};

use crate::{CreateOrUpdateWalletInfo, error::CustomError};


pub fn create_or_update_wallet_info(ctx: Context<CreateOrUpdateWalletInfo>) -> Result<()>{
	if ctx.accounts.mint_pda_account.is_initialized && ctx.accounts.mint_pda_account.linked_address != None{
		if ctx.accounts.mint_pda_account.linked_address.unwrap() == ctx.accounts.initializer.key(){
			//updating the same wallet no change
			return Err(CustomError::AlreadyLinkedWithGivenWallet.into())
		}
		// remove nft from previous pda account
		let index = ctx.accounts.previous_wallet_pda_account.as_ref().unwrap().linked_nfts.binary_search(&ctx.accounts.mint.key());
		ctx.accounts.previous_wallet_pda_account.as_mut().unwrap().linked_nfts.remove(index.unwrap());
		// add nft to wallet pda account
		if !ctx.accounts.new_wallet_pda_account.linked_nfts.contains(&ctx.accounts.mint.key()){
			ctx.accounts.new_wallet_pda_account.linked_nfts.push(ctx.accounts.mint.key());
		}
		// update info to mint pda account
		ctx.accounts.mint_pda_account.linked_address = Some(ctx.accounts.initializer.key());
	}else{
		//update initial info to mint pda account
		ctx.accounts.mint_pda_account.is_initialized = true;
		ctx.accounts.mint_pda_account.mint_address = ctx.accounts.mint.key();
		//update info to mint pda account
		ctx.accounts.mint_pda_account.linked_address = Some(ctx.accounts.initializer.key());
		//add linked nft to wallet pda account
		if ctx.accounts.new_wallet_pda_account.linked_nfts.is_empty() {
			ctx.accounts.new_wallet_pda_account.linked_nfts = vec![ctx.accounts.mint.key()];
		}else if !ctx.accounts.new_wallet_pda_account.linked_nfts.contains(&ctx.accounts.mint.key()) {
			ctx.accounts.new_wallet_pda_account.linked_nfts.push(ctx.accounts.mint.key());
		}
		if ctx.accounts.new_wallet_pda_account.owner != ctx.accounts.initializer.key() {
			ctx.accounts.new_wallet_pda_account.owner = ctx.accounts.initializer.key();
		}
	}
	
	Ok(())
}

