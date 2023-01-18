use crate::AddContent;
use anchor_lang::{prelude::*};

pub fn add_content(ctx: Context<AddContent>, name: String, url: String) -> Result<()>{
	//update data on the data pda account
	ctx.accounts.mint_pda_data_account.name = name;
	ctx.accounts.mint_pda_data_account.url = url;
	//update data on the mint pda account
	if !ctx.accounts.mint_pda_account.linked_data.contains(&ctx.accounts.initializer.key()){
		ctx.accounts.mint_pda_account.linked_data.push(ctx.accounts.initializer.key());
	}
	Ok(())
}
