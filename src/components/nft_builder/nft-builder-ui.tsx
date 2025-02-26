'use client';

import { useNftBuilderProgramMint } from './mint/mint-data-access'
import { useNftBuilderProgramEdit } from './edit/edit-data-access'
import { useArweaveProgram } from '../arweave/arweave-data-access'
import * as anchor from "@coral-xyz/anchor"
import { type WalletContextState } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { type UploadResponse } from '@Irys/sdk/build/cjs/common/types'
import { type FileInfo } from '../arweave/arweave-data-access'

export async function NftBuilderMintCreate(
  {name, symbol, uri, wallet, verified, share}:
  {name: string, symbol: string, uri: string, wallet: WalletContextState, verified: boolean, share: number}
) {

  const [buttonText, setButtonText] = useState<string>("Authensise");

  // Only ever one creator
  const creators: [{address: anchor.web3.PublicKey, verified: boolean, share: number}] = 
  [
    {
      address: wallet.publicKey,
      verified: verified,
      share: share
    }
  ];

  const { mint } = useNftBuilderProgramMint({name, symbol, uri, creators});
  const { uploadData, createAndUploadMetadataPage } = useArweaveProgram({ wallet });
  const { edit } = useNftBuilderProgramEdit({payer: wallet.publicKey});

  async function authensusProcess() {

    setButtonText("Minting NFT...");
    const mintSignature: string = await mint.mutateAsync();

    setButtonText("Uploading File...");
    const { dataUploadResult, fileInfo }: { dataUploadResult: UploadResponse, fileInfo: FileInfo } = await uploadData.mutateAsync();

    setButtonText("Uploading Metadata...");
    const metadataUploadResult: UploadResponse = await createAndUploadMetadataPage.mutateAsync(
      {
        tokenCreationSignature: mintSignature,
        fileInfo,
        fileLocation: `https://gateway.irys.xyz/${dataUploadResult.id}`,
        // nftTimestamp,
        creator: wallet.publicKey.toString()
      }
    );

    const newUri: string = `https://gateway.irys.xyz/${metadataUploadResult.id}`;

    setButtonText("Editing Metadata URI...");
    await edit.mutateAsync(newUri);
  }

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => authensusProcess()}
      disabled={(mint.isPending || uploadData.isPending || createAndUploadMetadataPage.isPending || edit.isPending)}
    >
      {buttonText}
    </button>
  );
}

export function NftBuilderProgram(
  {name, symbol, uri, address, verified, share}:
  {name: string, symbol: string, uri: string, address: anchor.web3.PublicKey, verified: boolean, share: number}
) {

  // Only ever one creator
  const creators: [{address: anchor.web3.PublicKey, verified: boolean, share: number}] = 
  [
    {
      address: address,
      verified: verified,
      share: share
    }
  ];
  
  const { getProgramAccount } = useNftBuilderProgramMint({name, symbol, uri, creators});

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  );
}
