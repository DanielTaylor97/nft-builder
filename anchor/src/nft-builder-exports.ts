// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import NftBuilderIDL from '../target/idl/nft_builder.json'
import type { NftBuilder } from '../target/types/nft_builder'

// Re-export the generated IDL and type
export { NftBuilder, NftBuilderIDL }

// The programId is imported from the program IDL.
export const NFT_BUILDER_PROGRAM_ID = new PublicKey(NftBuilderIDL.address)

// This is a helper function to get the NFT Builder Anchor program.
export function getNftBuilderProgram(provider: AnchorProvider) {
  return new Program(NftBuilderIDL as NftBuilder, provider)
}