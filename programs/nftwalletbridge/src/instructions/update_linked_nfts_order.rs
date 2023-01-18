use anchor_lang::{prelude::*};

use crate::UpdateLinkedNFtsOrder;

pub fn update_linked_nfts_order(ctx: Context<UpdateLinkedNFtsOrder>, linked_nfts: Vec<Pubkey>) -> Result<()>{
	//change the order for the linked Nfts
	ctx.accounts.current_wallet_pda_account.linked_nfts = linked_nfts;
	Ok(())
}

