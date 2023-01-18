use anchor_lang::{prelude::*};

use crate::{RemoveContent, error::CustomError};

pub fn remove_content(ctx: Context<RemoveContent>, key_to_remove: Pubkey) -> Result<()>{
	// if key to remove is from the initializer or initializer is the owner of the mint_pda_account, remove the data
	if key_to_remove.eq(&ctx.accounts.initializer.key()) || ctx.accounts.initializer.key() == ctx.accounts.mint_pda_account.linked_address.unwrap(){
		//remove data from nft
		let index = ctx.accounts.mint_pda_account.linked_data.binary_search(&key_to_remove);
		ctx.accounts.mint_pda_account.linked_data.remove(index.unwrap());
		//close data pda account
		ctx.accounts.mint_pda_data_account.close(ctx.accounts.initializer.to_account_info().clone())
	}else{
		Err(CustomError::UnauthorisedRemovalOfData.into())
	}
}