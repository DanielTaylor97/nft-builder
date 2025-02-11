use crate::EditMetadata;
use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{ update_metadata_accounts_v2,UpdateMetadataAccountsV2 },
    token::{
        set_authority,
        SetAuthority,
        spl_token::instruction::AuthorityType 
    },
};
use mpl_token_metadata::{
    accounts::Metadata as MplMetadata,
    types::DataV2
};


pub fn edit_token_metadata(
    ctx: &Context<EditMetadata>,
    arweave_uri: String
) -> Result<()> {
    msg!("Changing the metadata URI...");

    let payer = ctx.accounts.payer.to_account_info();
    let metadata_account = ctx.accounts.metadata_account.clone().to_account_info();
    let token_metadata_program = ctx.accounts.token_metadata_program.to_account_info();
    let master_edition_account = ctx.accounts.master_edition_account.to_account_info();

    let metadata_pre = ctx.accounts.metadata_account.clone();

    // Read the existing metadata and deserialise
    let metadata = metadata_pre.data.try_borrow_mut().unwrap();
    let metadata_deserialised = MplMetadata::safe_deserialize(&mut metadata.as_ref())?;

    // Destructure just to see exactly what we're dealing with
    let MplMetadata{
        key: _,
        update_authority: _,
        mint: _,
        name,
        symbol,
        uri: _,
        seller_fee_basis_points,
        creators,
        primary_sale_happened: _,
        is_mutable: _,
        edition_nonce: _,
        token_standard: _,
        collection,
        uses,
        collection_details: _,
        programmable_config: _
    } = metadata_deserialised;

    let metadata_creation_data = DataV2{
        name: name,
        symbol: symbol,
        uri: arweave_uri,
        seller_fee_basis_points: seller_fee_basis_points,
        creators: creators,
        collection: collection,
        uses: uses,
    };

    drop(metadata);

    let metadata_update_cpi_ctx = CpiContext::new(
        token_metadata_program,
        UpdateMetadataAccountsV2{
            metadata: metadata_account,
            update_authority: payer
        }
    );

    update_metadata_accounts_v2(
        metadata_update_cpi_ctx,
        Some(master_edition_account.key()),
        Some(metadata_creation_data),
        Some(false),
        Some(false)
    )?;

    msg!("Updated the token metadata!");

    Ok(())
}


// This is redundant -- mint authority and freeze authority are automatically changed as appropriate
// in the creation of the master edition account
pub fn change_mint_account_authority(ctx: &Context<EditMetadata>) -> Result<()> {
    msg!("Changing the mint and update authorities to the Master Edition Account...");

    let payer_1 = ctx.accounts.payer.to_account_info();
    let mint_account_1 = ctx.accounts.mint_account.to_account_info();
    let token_program_1 = ctx.accounts.token_program.to_account_info();

    let payer_2 = ctx.accounts.payer.to_account_info();
    let mint_account_2 = ctx.accounts.mint_account.to_account_info();
    let token_program_2 = ctx.accounts.token_program.to_account_info();

    let master_edition_account = ctx.accounts.master_edition_account.to_account_info();

    let mint_update_cpi_ctx = CpiContext::new(
        token_program_1,
        SetAuthority{
            current_authority: payer_1,
            account_or_mint: mint_account_1,
        }
    );

    let freeze_update_cpi_ctx = CpiContext::new(
        token_program_2,
        SetAuthority{
            current_authority: payer_2,
            account_or_mint: mint_account_2,
        }
    );

    // Change mint authority
    set_authority(
        mint_update_cpi_ctx,
        AuthorityType::MintTokens,
        Some(master_edition_account.key())
    )?;

    // Change freeze authority
    set_authority(
        freeze_update_cpi_ctx,
        AuthorityType::FreezeAccount,
        Some(master_edition_account.key())
    )?;

    /*
    // Change owner
    set_authority(
        mint_update_cpi_ctx,
        AuthorityType::AccountOwner,
        Some(master_edition_account.key())
    )?;
    */

    msg!("Successfully changed the mint and update authorities!");

    Ok(())
}
