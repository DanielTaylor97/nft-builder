use crate::MintToken;
use anchor_lang::prelude::*;
use anchor_spl::{
    token,
    metadata::{ create_metadata_accounts_v3, CreateMetadataAccountsV3, create_master_edition_v3, CreateMasterEditionV3 }
};
use mpl_token_metadata::types::{ Creator, DataV2 };


const ONE_TOKEN: u64 = 1;


pub fn create_token_metadata_account(
    ctx: &Context<MintToken>,
    name: String,
    symbol: String,
    uri: String,
    creators: Vec<Creator>
) -> Result<()> {
    msg!("Creating the metadata account...");

    let payer = ctx.accounts.payer.to_account_info();
    let mint_account = ctx.accounts.mint_account.to_account_info();
    let mint_authority = ctx.accounts.payer.to_account_info();
    let metadata_account = ctx.accounts.metadata_account.to_account_info();
    let token_metadata_program = ctx.accounts.token_metadata_program.to_account_info();
    let update_authority = ctx.accounts.payer.to_account_info();
    let system_program = ctx.accounts.system_program.to_account_info();
    let rent = ctx.accounts.rent.to_account_info();

    let metadata_creation_data = DataV2{
        name: name,
        symbol: symbol,
        uri: uri,
        seller_fee_basis_points: 0,
        creators: Some(creators),
        collection: None,
        uses: None,
    };

    let metadata_creation_cpi_ctx = CpiContext::new(
        token_metadata_program,
        CreateMetadataAccountsV3{
            metadata: metadata_account,
            mint: mint_account,
            mint_authority: mint_authority,
            payer: payer,
            update_authority: update_authority,
            system_program: system_program,
            rent: rent
        }
    );

    create_metadata_accounts_v3(
        metadata_creation_cpi_ctx,
        metadata_creation_data,
        true,
        false,
        None
    )?;

    msg!("Metadata account {} created successfully!", ctx.accounts.metadata_account.key());

    Ok(())
}


pub fn mint_token_to_associated_token_account(ctx: &Context<MintToken>) -> Result<()> {
    msg!("Minting token to ATA...");

    let mint_cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token::MintTo{
            mint: ctx.accounts.mint_account.to_account_info(),
            to: ctx.accounts.associated_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        }
    );

    token::mint_to(mint_cpi_ctx, ONE_TOKEN)?;

    msg!("{} token successfully minted to account {}", ONE_TOKEN, ctx.accounts.associated_token_account.key());

    Ok(())
}

pub fn create_master_edition_account(ctx: &Context<MintToken>,) -> Result<()> {
    msg!("Creating the master edition account...");

    let payer = ctx.accounts.payer.to_account_info();
    let mint_account = ctx.accounts.mint_account.to_account_info();
    let master_edition_account = ctx.accounts.master_edition_account.to_account_info();
    let token_metadata_program = ctx.accounts.token_metadata_program.to_account_info();
    let update_authority = ctx.accounts.payer.to_account_info();
    let mint_authority = ctx.accounts.payer.to_account_info();
    let metadata_account = ctx.accounts.metadata_account.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();
    let system_program = ctx.accounts.system_program.to_account_info();
    let rent = ctx.accounts.rent.to_account_info();

    let edition_creation_ctx = CpiContext::new(
        token_metadata_program,
        CreateMasterEditionV3{
            edition: master_edition_account,
            mint: mint_account,
            update_authority: update_authority,
            mint_authority: mint_authority,
            payer: payer,
            metadata: metadata_account,
            token_program: token_program,
            system_program: system_program,
            rent: rent,
        }
    );

    create_master_edition_v3(
        edition_creation_ctx,
        None
    )?;

    msg!("Master edition account {} created successfully!", ctx.accounts.master_edition_account.key());
    
    Ok(())
}

