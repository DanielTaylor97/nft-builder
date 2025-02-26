'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { metadata } from './metadata-creator'
import { getIrys, uploadData as uploadDataToIrys, uploadFile } from './irys/utils'

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useTransactionToast } from '../ui/ui-layout'
import { UploadResponse } from '@Irys/sdk/build/cjs/common/types'
import WebIrys from '@Irys/sdk'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { unlink, readdir } from 'fs/promises'

const DIRECTORY: string = "../../temp";

export type FileInfo = {
    fileType: string;
    fileSizeKb: number;
    fileHash: string;
}

export function useArweaveProgram(
    { wallet }:
    { wallet: WalletContextState }
) {
    
    const { cluster } = useCluster();
    const irys = getIrys(cluster, wallet);
    const transactionToast = useTransactionToast();

    const uploadData = useMutation(
        {
            // mutationKey: ['', { cluster }],
            mutationFn: () => uploadDataFn(irys),
            onSuccess: ({ dataUploadResult, fileInfo }: { dataUploadResult: UploadResponse; fileInfo: FileInfo; }) => {
              transactionToast(dataUploadResult.id);
            },
            onError: (err) => toast.error(`Failed to upload the file to Arweave: ${err.message}`),
        }
    );

    const createAndUploadMetadataPage = useMutation<UploadResponse, Error, any>(
        {
            // mutationKey: ['', { cluster }],
            mutationFn: ({
                tokenCreationSignature,
                fileInfo,
                fileLocation,
                // nftTimestamp,
                creator
            }) => createAndUploadMetadataPageFn(irys, tokenCreationSignature, fileInfo, fileLocation, creator),
            onSuccess: (response: UploadResponse) => {
              transactionToast(response.id);
            },
            onError: (err: Error) => toast.error(`Failed to upload the token Metadata to Arweave: ${err.message}`),
        }
    );

    return {
        uploadData,
        createAndUploadMetadataPage,
    };
}

async function uploadDataFn(
    irysInstancePromise: Promise<WebIrys>
): Promise<{ dataUploadResult: UploadResponse; fileInfo: FileInfo; }> {

    const irysInstance = await irysInstancePromise;

    const dataToUpload = "This is the data";

    const fileInfo: FileInfo = {
        fileType: "",
        fileSizeKb: 20,
        fileHash: ""
    };

    const tags = [
    {
        name: "App-name",
        value: "Authensus",
    },
    {
        name: "Verison",
        value: "0.0.1",
    },
    {
        name: "Type",
        value: "text",
    },
   ]

   // Completes the data upload and awaits the result, such that the file is available at https://gateway.irys.xyz/<result.id>
   const dataUploadResult = await uploadDataToIrys(irysInstance, dataToUpload, tags);

    return {
        dataUploadResult,
        fileInfo
    };

    /*
        response = {
            id, // Transaction id (used to download the data)
            timestamp, // Timestamp (UNIX milliseconds) of when the transaction was created and verified
            version, // The version of this JSON file, currently 1.0.0
            public, // Public key of the bundler node used
            signature, // A signed deep hash of the JSON receipt
            deadlineHeight, // The block number by which the transaction must be finalized on Arweave
            block, // Deprecated
            validatorSignatures, // Deprecated
            verify, // An async function used to verify the receipt at any time
        }
     */

}

async function createAndUploadMetadataPageFn(
    irysInstancePromise: Promise<WebIrys>,
    tokenCreationSignature: string,
    fileInfo: FileInfo,
    fileLocation: string,
    // nftTimestamp: string,
    creator: string
): Promise<UploadResponse> {

    let irysInstance = await irysInstancePromise;

    let metadataString = metadata(
        tokenCreationSignature,
        fileInfo.fileType,
        fileInfo.fileSizeKb,
        fileInfo.fileHash,
        fileLocation,
        // nftTimestamp,
        creator
    );

    const tags = [
     {
        name: "App-name",
        value: "Authensus",
     },
     {
        name: "Verison",
        value: "1.0.0",
     },
     {
        name: "Type",
        value: "JSON",
     },
    ];

    const tempLoc = join(DIRECTORY, "metadata.json");

    await clearFolder();

    writeFileSync(tempLoc, metadataString);

    const dataUploadResult = await uploadFile(irysInstance, tempLoc, tags);

    await clearFolder();

    return dataUploadResult;

}

async function clearFolder() {
    for (const file of await readdir(DIRECTORY)) {
        await unlink(join(DIRECTORY, file));
    }
}
