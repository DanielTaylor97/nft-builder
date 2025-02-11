#![cfg(feature="test-bpf")]

use anchor_client::solana_sdk::{
    program_pack::Pack,
    signature::Keypair,
    signer::Signer,
    transaction::Transaction,
};
use anchor_lang::{
    ToAccountMetas,
    InstructionData,
    solana_program::{
        instruction::Instruction,
        system_program,
        sysvar,
    }
};
use anchor_spl::{
    associated_token::{ get_associated_token_address, ID as ASSOCIATED_TOKEN_PROGRAM_ID },
    token::spl_token
};
use nft_builder::utils::{
    find_master_edition_account,
    find_metadata_account,
    token_metadata_program_id,
    Creator
};
use mpl_token_metadata::accounts::Metadata;
use solana_program_test::tokio;


mod utils;
use utils::*;


#[tokio::test]
async fn edit_metadata_success() {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                          SETUP
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Go through the process of creating and minting the token first
    let mut context = nft_builder_test().start_with_context().await;

    let payer = context.payer;

    let mint = Keypair::new();

    let (metadata, _) = find_metadata_account(mint.pubkey());
    let (master_edition_account, _) = find_master_edition_account(mint.pubkey());

    let ata = get_associated_token_address(&payer.pubkey(), &mint.pubkey());

    let metadata_creators = vec![
        Creator{
            address: payer.pubkey(),
            verified: false,
            share: 100,
        },
    ];

    let data = nft_builder::instruction::Mint{
        name: String::from("Test NFT"),
        symbol: String::from("TESTICLE2"),
        uri: String::from("https://testic.le/test_nft_3"),
        creators: metadata_creators,
    };

    let accounts = nft_builder::accounts::MintToken{
        payer: payer.pubkey(),
        mint_account: mint.pubkey(),
        metadata_account: metadata,
        master_edition_account: master_edition_account,
        associated_token_account: ata,
        associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
        token_metadata_program: token_metadata_program_id(),
        system_program: system_program::id(),
        token_program: spl_token::id(),
        rent: sysvar::rent::id(),
    };

    let create_ix = Instruction{
        program_id: nft_builder::id(),
        data: data.data(),
        accounts: accounts.to_account_metas(None),
    };

    let new_uri = String::from("https://testic.le/test_nft_2");

    let data = nft_builder::instruction::Edit{
        arweave_uri: new_uri,
    };

    let accounts = nft_builder::accounts::EditMetadata{
        payer: payer.pubkey(),
        mint_account: mint.pubkey(),
        metadata_account: metadata,
        master_edition_account: master_edition_account,
        token_metadata_program: token_metadata_program_id(),
        token_program: spl_token::id(),
    };

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                      EXECUTION
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    let edit_ix = Instruction{
        program_id: nft_builder::id(),
        data: data.data(),
        accounts: accounts.to_account_metas(None),
    };

    let tx = Transaction::new_signed_with_payer(
        &[create_ix, edit_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint],
        context.last_blockhash
    );

    context.banks_client.process_transaction(tx).await.unwrap();

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                      ASSERTIONS
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    let metadata_account = context.banks_client
        .get_account(metadata)
        .await
        .expect("Account not found")
        .expect("Account is empty")
    ;

    let metadata_account_data = Metadata::safe_deserialize(metadata_account.data.as_slice()).unwrap();

    assert_eq!(trim_uri(metadata_account_data.uri), String::from("https://testic.le/test_nft_2"));

    let mint_account = context.banks_client
        .get_account(mint.pubkey())
        .await
        .expect("Account not found")
        .expect("Account is empty")
    ;

    let mint_account_data = crate::spl_token::state::Mint::unpack(mint_account.data.as_slice()).unwrap();

    assert_eq!(mint_account_data.mint_authority.unwrap(), master_edition_account);
    assert_eq!(mint_account_data.freeze_authority.unwrap(), master_edition_account);
}

#[tokio::test]
async fn failure_if_not_initialised() {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                          SETUP
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    let mut context = nft_builder_test().start_with_context().await;

    let payer = context.payer;

    let mint = Keypair::new();

    let (metadata, _) = find_metadata_account(mint.pubkey());
    let (master_edition_account, _) = find_master_edition_account(mint.pubkey());

    let new_uri = String::from("https://testic.le/test_nft");

    let data = nft_builder::instruction::Edit{
        arweave_uri: new_uri,
    };

    let accounts = nft_builder::accounts::EditMetadata{
        payer: payer.pubkey(),
        mint_account: mint.pubkey(),
        metadata_account: metadata,
        master_edition_account: master_edition_account,
        token_metadata_program: token_metadata_program_id(),
        token_program: spl_token::id(),
    };

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                      EXECUTION
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    let edit_ix = Instruction{
        program_id: nft_builder::id(),
        data: data.data(),
        accounts: accounts.to_account_metas(None),
    };

    let tx = Transaction::new_signed_with_payer(
        &[edit_ix],
        Some(&payer.pubkey()),
        &[&payer],
        context.last_blockhash
    );

    let err = context.banks_client.process_transaction(tx).await.unwrap_err();

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                      ASSERTIONS
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    assert_error(err, ERROR_CODE_ACCOUNT_NOT_INITIALISED);

}

