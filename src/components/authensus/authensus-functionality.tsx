'use client';

import { useMutation } from '@tanstack/react-query'
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

export type AuthensusResult = {
    mintSignature: string;
    dataUploadResult: UploadResponse;
    metadataUploadResult: UploadResponse;
    editSignature: string;
};

export function useAuthensusFunctionality() {

    const authensusToast = useTransactionToast();

    const authensise = useMutation<AuthensusResult, Error, any>({
        mutationFn: ({ files, wallet, cluster, provider }) => authensus(files, wallet, cluster, provider),
        onSuccess: ({ mintSignature, dataUploadResult, metadataUploadResult, editSignature }) => {
            authensusToast(editSignature);
        },
        onError: (error) => {
            toast.error(`Authensus process failed with error ${error}`);
        },
    })

    return { authensise };

}

async function authensus(
    files: [File],
    wallet: WalletContextState,
    cluster: Cluster,
    provider: anchor.AnchorProvider
  ): Promise<AuthensusResult> {

    const file = files[0];

    const mintRpcObj = getFileInfo(file, wallet);
    
    // Create a new account keypair as the mint -- every new file upload needs to have a new mint such that is the unique NFT of that mint
    const mintKeypair = anchor.web3.Keypair.generate();

    const mintSignature: string = await runMintRpc({
        mintObj: mintRpcObj,
        mintKeypair,
        provider
    });

    const irysInstance = getIrys(cluster, wallet);

    const { dataUploadResult, fileInfo }: { dataUploadResult: UploadResponse, fileInfo: FileInfo } = await uploadDataFn(irysInstance, file);

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

    const result: AuthensusResult = {
        mintSignature,
        dataUploadResult,
        metadataUploadResult,
        editSignature
    };

    return result;
}

const getFileInfo = (file: File, wallet: WalletContextState): MintRpcObject => {
    try {
        const creators: [{address: anchor.web3.PublicKey, verified: boolean, share: number}] = 
        [
          {
            address: wallet.publicKey,
            verified: true,
            share: 100
          }
        ];

        const fileInfo: MintRpcObject = {
            name: file.name,
            symbol: symbolise(wallet.publicKey, file.name.length > 0 ? file.name : "file"),
            uri: "http://temp-uri.json",
            creators: creators
        }

        return fileInfo;
    } catch(error) {
        throw new Error(`Error while getting the file info: ${error.message}`)
    }
}

const symbolise = (
    user: anchor.web3.PublicKey,
    fileName: string
): string => {
    // User address is guaranteed to have length > 0
    const prefix = user.toString().substring(0, 3);

    const chars = charsOnly(fileName);
    const suffix = chars.length > 0 ? (chars.length > 3 ? chars.substring(0, 3).toUpperCase() : chars.toUpperCase()) : "FIL"

    return prefix + "-" + suffix;
}

const charsOnly = (str: string): string => {
    return str.split(".")[0].replace(/[^a-zA-Z0-9]/g, '');
}
