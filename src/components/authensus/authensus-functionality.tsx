'use client';

import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as anchor from "@coral-xyz/anchor"

import { useTransactionToast } from '../ui/ui-layout'
import { getIrys } from '../arweave/irys/utils'
import { MintRpcObject, runMintRpc } from '../nft_builder/mint/mint-data-access'
import { runEditRpc } from '../nft_builder/edit/edit-data-access'
import { uploadDataFn, createAndUploadMetadataPageFn, FileInfo } from '../arweave/arweave-data-access'
import { UploadResponse } from '@irys/upload-core/dist/types/types'
import { Cluster } from '../cluster/cluster-data-access'
import { WalletContextState } from '@solana/wallet-adapter-react'

export function useAuthensusFunctionality() {

    const authensusToast = useTransactionToast();

    const authensise = useMutation<string, Error, any>({
        mutationFn: ({ mintRpcObj, wallet, cluster, provider }) => authensus(mintRpcObj, wallet, cluster, provider),
        onSuccess: (signature) => {
            authensusToast(signature);
        },
        onError: (error) => {
            toast.error(`Authensus process failed with error ${error}`);
        },
    })

    return { authensise };

}

async function authensus(
    mintRpcObj: MintRpcObject,
    wallet: WalletContextState,
    cluster: Cluster,
    provider: anchor.AnchorProvider
  ): Promise<string> {
    
    // Create a new account keypair as the mint -- every new file upload needs to have a new mint such that is the unique NFT of that mint
    const mintKeypair = anchor.web3.Keypair.generate();

    const mintSignature: string = await runMintRpc({
        mintObj: mintRpcObj,
        mintKeypair,
        provider
    });

    const irysInstance = getIrys(cluster, wallet);

    const { dataUploadResult, fileInfo }: { dataUploadResult: UploadResponse, fileInfo: FileInfo } = await uploadDataFn(irysInstance);

    const metadataUploadResult: UploadResponse = await createAndUploadMetadataPageFn(
        irysInstance,
        mintSignature,
        fileInfo,
        `https://gateway.irys.xyz/${dataUploadResult.id}`,
        mintKeypair.publicKey.toString(),
        // nftTimestamp,
        wallet.publicKey.toString()
    );

    const newUri: string = `https://gateway.irys.xyz/${metadataUploadResult.id}`;

    const editSignature = await runEditRpc({
        payer: mintRpcObj.creators[0].address as anchor.web3.PublicKey,
        mintAccount: mintKeypair.publicKey,
        newUri,
        provider
    });

    return editSignature;
}
