use anchor_lang::prelude::*;
use mpl_token_metadata::types::Creator as MPL_Creator;
use crate::constants::{ METADATA, EDITION };

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,  // Percentage, not basis points!
}

impl From<MPL_Creator> for Creator {
    fn from(creator: MPL_Creator) -> Self {
        Creator{
            address: creator.address,
            verified: creator.verified,
            share: creator.share,
        }
    }
}

pub fn into_mpl_creators(creators: Vec<Creator>) -> Vec<MPL_Creator> {
    creators.iter().map(
        |creator| MPL_Creator {
            address: creator.address,
            verified: creator.verified,
            share: creator.share,
        }
    )
    .collect()
}

pub fn token_metadata_program_id() -> Pubkey {
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s".parse().unwrap()
}

pub fn find_master_edition_account(mint: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[METADATA.as_bytes(), token_metadata_program_id().as_ref(), mint.as_ref(), EDITION.as_bytes()],
        &token_metadata_program_id()
    )
}

pub fn find_metadata_account(mint: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[METADATA.as_bytes(), token_metadata_program_id().as_ref(), mint.as_ref()],
        &token_metadata_program_id()
    )
}

