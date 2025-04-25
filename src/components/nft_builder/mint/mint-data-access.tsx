'use client';

import { NFT_BUILDER_PROGRAM_ID as programId, getNftBuilderProgram } from "../../../../anchor/src"//'@project/anchor'

import * as anchor from "@coral-xyz/anchor"

export type MintRpcObject = {
  name: string;
  symbol: string;
  uri: string;
  creators: [{
    address: anchor.web3.PublicKey,
    verified: boolean,
    share: number
  }];
}

export function runMintRpc(
  { mintObj, mintKeypair, provider }:
  { mintObj: MintRpcObject, mintKeypair: anchor.web3.Keypair, provider: anchor.AnchorProvider }
): Promise<string> {

  try {
    const program = getNftBuilderProgram(provider);

    const mintSignature = program.methods.mint(mintObj.name, mintObj.symbol, mintObj.uri, mintObj.creators)
    .accounts(
      {
        payer: mintObj.creators[0].address,
        mintAccount: mintKeypair.publicKey,
      }
    )
    .signers(
      [mintKeypair]
    )
    .rpc();

    return mintSignature;
  } catch (error) {
    throw new Error(`Error while minting the token: ${error.message}`);
  }
}
