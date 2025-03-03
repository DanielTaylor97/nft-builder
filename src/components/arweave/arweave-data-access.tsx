'use client'

import { metadata } from './metadata-creator'
import { uploadData as uploadDataToIrys, uploadFile } from './irys/utils'

import type { UploadResponse } from '@irys/upload-core/dist/types/types'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { unlink, readdir } from 'fs/promises'
import BaseWebIrys from '@irys/web-upload/dist/types/base'

const DIRECTORY: string = "../../temp";

export type FileInfo = {
    fileType: string;
    fileSizeKb: number;
    fileHash: string;
}

export async function uploadDataFn(
    irysInstancePromise: Promise<BaseWebIrys>
): Promise<{ dataUploadResult: UploadResponse; fileInfo: FileInfo; }> {

    try {
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
    } catch(error) {
        throw new Error(`Error while uploading the data: ${error.message}`);
    }

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

export async function createAndUploadMetadataPageFn(
    irysInstancePromise: Promise<BaseWebIrys>,
    tokenCreationSignature: string,
    fileInfo: FileInfo,
    fileLocation: string,
    mintPk: string,
    // nftTimestamp: string,
    creator: string
): Promise<UploadResponse> {

    try {
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

        const file = new File([], `${mintPk}_metadata.json`, {type: "application/json"});

        const dataUploadResult = await uploadFile(irysInstance, file, tags);

        return dataUploadResult;
    } catch(error) {
        throw new Error(`Error while creating and uploading metadata file: ${error.message}`);
    }

}

async function clearFolder() {
    try {
        for (const file of await readdir(DIRECTORY)) {
            await unlink(join(DIRECTORY, file));
        }
    } catch(error) {
        throw new Error(`Error while clearing folder: ${error.message}`);
    }
}
