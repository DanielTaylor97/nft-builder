#![allow(dead_code)]
use anchor_client::solana_sdk::transaction::TransactionError;
use anchor_lang::solana_program::instruction::InstructionError;
use nft_builder::utils::token_metadata_program_id;
use solana_program_test::{ BanksClientError, ProgramTest };


pub const ERR_CREATORS_LIST_TOO_LON: u32 = 36;
pub const ERROR_CODE_ACCOUNT_NOT_INITIALISED: u32 = 3012;

pub fn nft_builder_test() -> ProgramTest {
    let mut program = ProgramTest::new(
        "nft_builder",
        nft_builder::id(),
        None,
    );
    program.add_program(
        "mpl_token_metadata",
        token_metadata_program_id(),
        None,
    );
    program.set_compute_max_units(500_000);

    program
}

pub fn assert_error(error: BanksClientError, expected_error: u32) {
    match error {
        BanksClientError::TransactionError(TransactionError::InstructionError(
            0,
            InstructionError::Custom(e)
        )) => assert_eq!(e, expected_error),
        _ => assert!(false)
    }
}

pub fn trim_uri(input_uri: String) -> String {
    let mut characters = input_uri.chars();

    if let Some(c) = characters.next() {

        if c == char::MIN {
            return String::from("")
        }

        let mut return_uri = String::with_capacity(200);
        return_uri.push_str(c.to_string().as_str());
        
        while let Some(c) = characters.next() {
            if c == char::MIN {
                return return_uri;
            }
            return_uri.push_str(c.to_string().as_str());
        }
        return input_uri
    }
    else {
        input_uri
    }

}

