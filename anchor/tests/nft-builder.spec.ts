import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NftBuilder } from "../target/types/nft_builder";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";


const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const METADATA = "metadata";
const EDITION = "edition";

export const find_metadata_address = ({mint}: {mint: anchor.web3.PublicKey}):
[anchor.web3.PublicKey, number] =>
anchor.web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from(METADATA),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

export const find_master_edition_address = ({mint}: {mint: anchor.web3.PublicKey}):
[anchor.web3.PublicKey, number] =>
anchor.web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from(METADATA),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
    Buffer.from(EDITION),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

describe("nft-builder-test", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = provider.wallet as anchor.Wallet;
  console.log("Payer account: ", payer.publicKey.toString());

  const nftBuilderProgram = anchor.workspace.NftBuilder as Program<NftBuilder>;

  it("Is initialized!", async () => {

    const mintKeypair = anchor.web3.Keypair.generate();
    console.log("Mint account: ", mintKeypair.publicKey.toString());

    const masterEditionKeypair = anchor.web3.Keypair.generate();
    console.log("Metadata account: ", masterEditionKeypair.publicKey.toString());

    const name = "Doc Token";
    const symbol = "DTOK";
    const initialUri = "https://temp-uri.json";
    const creators = [
      {
        address: payer.publicKey,
        share: 100,
        verified: false,
      }
    ];

    // Create and mint the token
    try {
      const tx = await nftBuilderProgram.methods.mint(
        name,
        symbol,
        initialUri,
        creators,
      )
      .accounts(
        {
          payer: payer.publicKey,
          mintAccount: mintKeypair.publicKey,
        }
      )
      .signers(
        [mintKeypair, payer.payer]
      )
      .rpc();

      console.log("Transaction signature from token minting: ", tx);
    }
    catch(e) {
      console.log("There was an error while trying to mint the token:");
      console.log(e);
    }

    const arweaveUri = "https://arweave-uri.json";

    // Change the URI
    try{
      const tx = await nftBuilderProgram.methods.edit(
        arweaveUri,
      )
      .accounts(
        {
          payer: payer.publicKey,
          mintAccount: mintKeypair.publicKey,
        }
      )
      .signers(
        [payer.payer]
      )
      .rpc();

      console.log("Transaction signature from metadata edit: ", tx);
    }
    catch(e) {
      console.log("");
      console.log(e);
    }

  });
});
