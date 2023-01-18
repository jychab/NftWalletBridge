use anchor_lang::{prelude::*};

use crate::{RemoveWalletInfo};


pub fn remove_wallet_info(ctx: Context<RemoveWalletInfo>) -> Result<()>{
	//remove nft from curent wallet pda
	let index = ctx.accounts.current_wallet_pda_account.linked_nfts.binary_search(&ctx.accounts.mint_pda_account.mint_address);
	ctx.accounts.current_wallet_pda_account.linked_nfts.remove(index.unwrap());
	if ctx.accounts.current_wallet_pda_account.linked_nfts.len() == 0 {
		ctx.accounts.current_wallet_pda_account.close(ctx.accounts.initializer.to_account_info().clone()).unwrap();
	}
	//remove wallet from nft pda, set as system id
	ctx.accounts.mint_pda_account.linked_address = None;

	Ok(())
}

