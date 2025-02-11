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
    find_metadata_account,
    find_master_edition_account,
    token_metadata_program_id,
    Creator
};
use solana_program_test::tokio;

mod utils;
use utils::*;


// Simple test to create the mint and mint a single token to the appropriate ATA
#[tokio::test]
async fn mint_token_success() {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                          SETUP
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
        symbol: String::from("TESTICLE"),
        uri: String::from("https://testic.le/test_nft"),
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

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                      EXECUTION
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    let ix = Instruction{
        program_id: nft_builder::id(),
        data: data.data(),
        accounts: accounts.to_account_metas(None),
    };

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[&payer, &mint],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                      ASSERTIONS
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    let token_account = context.banks_client
        .get_account(ata)
        .await
        .expect("Account not found")
        .expect("Account is empty")
    ;

    let token_account_data = crate::spl_token::state::Account::unpack(token_account.data.as_slice()).unwrap();

    assert_eq!(token_account_data.amount, 1);
    assert_eq!(token_account_data.owner, payer.pubkey());

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

