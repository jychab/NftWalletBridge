use anchor_lang::{prelude::*};

#[account]
pub struct DataPdaState {
    pub name: String,
    pub url: String,
}
