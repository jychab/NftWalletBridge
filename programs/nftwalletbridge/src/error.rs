use anchor_lang::{error_code};

#[error_code]
pub enum CustomError {
    #[msg("Associated mint account is not from the given mint")]
    MintDoesNotMatch,
    #[msg(
        "There is a mismatch between given mint owner and initializer pub key"
    )]
    InitializerNotOwnerOfMint,
	#[msg(
        "There is a mismatch between given wallet and initializer pub key"
    )]
    InitializerNotOwnerOfWallet,
	#[msg(
		"A maximum of 6 nft has already been linked to the wallet"
	)]
	NumberOfNFTExceededOverallAlloowableAmount,
    #[msg(
		"Previous account info is missing"
	)]
	PreviousAccountInfoMissing,
    #[msg(
		"Current NFT is already linked with given wallet address"
	)]
	AlreadyLinkedWithGivenWallet,
	#[msg(
		"Previous account does not match existing mint account"
	)]
	PreviousAccountInfoDoesNotMatch,
	#[msg(
		"Mint PDA Account have not been initialized, previous_wallet_pda_account field should be none"
	)]
	MintPdaAccountNotYetInitialized,
	#[msg(
		"No such data exist"
	)]
	DataDoesNotExist,
	#[msg(
		"You're not authorised to remove the data"
	)]
	UnauthorisedRemovalOfData,
	#[msg(
		"A maximum limit of 1000 characters has exceeded"
	)]
	NumberOfCharactersHasExceededAllowableLimit,
}