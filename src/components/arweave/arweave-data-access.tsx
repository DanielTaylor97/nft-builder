'use client'

import { metadata } from './metadata-creator'
import { upfrontFundNodeConditional, uploadFile } from './irys/utils'

import type { UploadResponse } from '@irys/upload-core/dist/types/types'
import { join } from 'path'
import { unlink, readdir } from 'fs/promises'
import BaseWebIrys from '@irys/web-upload/dist/types/base'
import keccak256 from 'keccak256'
import { Buffer } from 'node:buffer'

const DIRECTORY: string = "../../temp";

export type FileInfo = {
    fileType: string;
    fileSize: number;
    fileHash: string;
}

export async function uploadDataFn(
    irysInstancePromise: Promise<BaseWebIrys>,
    file: File
): Promise<{ dataUploadResult: UploadResponse; fileInfo: FileInfo; }> {

    try {
        const irysInstance = await irysInstancePromise;

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileHash = keccak256(fileBuffer);

        const fileInfo: FileInfo = {
            fileType: file.type,
            fileSize: file.size,
            fileHash: fileHash.toString('hex')
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
                name: "Content-Type",
                value: file.type,
            },
        ];

        // Only need to fund the node for transactions > 100kB -- anything less is free on Irys
        if(file.size > 100*1000) {
            const amount = await irysInstance.getPrice(file.size);

            await upfrontFundNodeConditional(irysInstance, amount);
        }

        // Completes the data upload and awaits the result, such that the file is available at https://gateway.irys.xyz/<result.id>
        const dataUploadResult = await uploadFile(irysInstance, file, tags);

        return {
            dataUploadResult,
            fileInfo
        };
    } catch(error) {
        throw new Error(`Error while uploading the data: ${error.message}`);
    }
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
            fileInfo.fileSize,
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
            name: "Content-Type",
            value: "application/json",
        },
        ];

        const file = new File([metadataString], `${mintPk}_metadata.json`, {type: "application/json"});

        // Only need to fund the node for transactions > 100kB -- anything less is free on Irys
        if(file.size > 100*1000) {
            // No further conversion needed as the file.size is in bytes, as needed by the function: https://developer.mozilla.org/docs/Web/API/Blob/size
            const amount = await irysInstance.getPrice(file.size);

            await upfrontFundNodeConditional(irysInstance, amount);
        }

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
