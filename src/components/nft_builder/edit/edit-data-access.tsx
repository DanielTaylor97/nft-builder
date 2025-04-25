'use client';

import { getNftBuilderProgram } from "../../../../anchor/src"
import * as anchor from "@coral-xyz/anchor"

export function runEditRpc(
  { payer, mintAccount, newUri, provider }:
  { payer: anchor.web3.PublicKey, mintAccount: anchor.web3.PublicKey, newUri: string, provider: anchor.AnchorProvider }
): Promise<string> {

  try {
    const program = getNftBuilderProgram(provider);

    const editSignature = program.methods.edit(newUri)
    .accounts(
      {
        payer: payer,
        mintAccount: mintAccount,
      }
    )
    .signers(
      []
    )
    .rpc();

    return editSignature;
  } catch (error) {
    throw new Error(`Error while editing the token metadata: ${error.message}`);
  }
}
