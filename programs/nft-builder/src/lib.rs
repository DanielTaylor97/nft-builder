use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
    metadata::Metadata,
};

pub mod instructions;
pub mod constants;
pub mod utils;

use instructions::*;
use constants::*;
use utils::*;

declare_id!("4U9DWTw7de8At9rAXZuF4pEpiT4MiPQMQAz9UHXaumKF");

#[program]
pub mod nft_builder {
    use super::*;

    pub fn mint(
        ctx: Context<MintToken>,
        name: String,
        symbol: String,
        uri: String,
        creators: Vec<Creator>
    ) -> Result<()> {

        create_token_metadata_account(
            &ctx,
            name,
            symbol,
            uri,
            into_mpl_creators(creators)
        )?;

        mint_token_to_associated_token_account(&ctx)?;

        create_master_edition_account(&ctx)?;
        
        Ok(())
    }

    pub fn edit(
        ctx: Context<EditMetadata>,
        arweave_uri: String,
    ) -> Result<()> {

        edit_token_metadata(
            &ctx,
            arweave_uri
        )?;

        // Don't need to do this as it's taken care of in the process of creating the master edition account in any case
        // change_mint_account_authority(&ctx)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintToken<'info_m> {
    #[account(mut)]
    pub payer: Signer<'info_m>,
    #[account(
        init,
        payer=payer,
        mint::decimals=0,
        mint::authority=payer,
        mint::freeze_authority=payer,
    )]
    pub mint_account: Account<'info_m, Mint>,
    /// CHECK: The token metadata account
    #[account(
        mut,
        seeds=[METADATA.as_bytes(), token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program=token_metadata_program.key()
    )]
    pub metadata_account: UncheckedAccount<'info_m>,
    /// CHECK: Master edition account
    #[account(
        mut,
        seeds=[METADATA.as_bytes(), token_metadata_program.key().as_ref(), mint_account.key().as_ref(), EDITION.as_bytes()],
        bump,
        seeds::program=token_metadata_program.key(),
    )]
    pub master_edition_account: UncheckedAccount<'info_m>,
    #[account(
        init,
        payer=payer,
        associated_token::mint=mint_account,
        associated_token::authority=payer
    )]
    pub associated_token_account: Account<'info_m, TokenAccount>,
    pub associated_token_program: Program<'info_m, AssociatedToken>,
    pub token_metadata_program: Program<'info_m, Metadata>,
    pub system_program: Program<'info_m, System>,
    pub token_program: Program<'info_m, Token>,
    pub rent: Sysvar<'info_m, Rent>,
}

#[derive(Accounts)]
pub struct EditMetadata<'info_e> {
    #[account(mut)]
    pub payer: Signer<'info_e>,
    #[account(
        mut,
        mint::decimals=0,
        mint::authority=master_edition_account,
        mint::freeze_authority=master_edition_account,
    )]
    pub mint_account: Account<'info_e, Mint>,
    /// CHECK: The token metadata account
    #[account(
        mut,
        seeds=[METADATA.as_bytes(), token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program=token_metadata_program.key()
    )]
    pub metadata_account: UncheckedAccount<'info_e>,
    /// CHECK: Master edition account
    #[account(
        mut,
        seeds=[METADATA.as_bytes(), token_metadata_program.key().as_ref(), mint_account.key().as_ref(), EDITION.as_bytes()],
        bump,
        seeds::program=token_metadata_program.key()
    )]
    pub master_edition_account: UncheckedAccount<'info_e>,
    pub token_metadata_program: Program<'info_e, Metadata>,
    pub token_program: Program<'info_e, Token>,
}
