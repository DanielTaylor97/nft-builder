import { type PublicKey } from '@solana/web3.js'
import axios from 'axios';

import { getMetadata, getTimestamps } from './metadata'
import { Cluster } from '../../../components/cluster/cluster-data-access'
import { type AuthensusResult } from '../../../components/authensus/authensus-functionality'


const BACKEND_URL = "http://localhost:3001";

export type StoredResult = {
    user: PublicKey;
    mint: PublicKey;
    creationTx: string;
    name: string;
    location: string | null;
    metadataLoc: string | null;
    hash: string | null;
    timestamp: number;
    size: number | null;
    complete: boolean;
}

export async function addNewResults(
    user: PublicKey,
    authensusResult: AuthensusResult,
    cluster,
) {
    const res = await getNewResults(user, authensusResult, cluster);

    const response = await axios.post(`${BACKEND_URL}/documents`, res as Object);

    if (response.status === 200) {
        // 
    } else {
        throw new Error(`Error while adding new results: ${response.status}`);
    }
}

export async function getFileType(metadataLoc: string): Promise<string> {
    try {
        const response = await fetch(metadataLoc);
        const metadata = await response.json();

        return metadata.data.type;
    } catch(error) {
        throw new Error(`Error while finding the file type: ${error.message}`);
    }
}

export async function getFileBuffer(loc: string) {
    const response = await axios.get(loc, { responseType: 'arraybuffer' });

    if(response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error while fetching the file: ${response.status}`);
    }
}

export async function getHistoricResults(
    user: PublicKey,
    // amount: number
): Promise<StoredResult[]> {
    const response = await axios.get(`${BACKEND_URL}/documents/${user.toString()}`);

    if (response.status === 200) {
        return await convertToResults(response.data);
    } else {
        throw new Error(`Error while fetching historic results: ${response.status}`);
    }
}

export async function getNewResults(
    user: PublicKey,
    authensusResult: AuthensusResult,
    cluster,
): Promise<StoredResult> {
    try {
        const mintAccount = authensusResult.mintKeypair.publicKey;

        const { solanaMetadata, customMetadata } = await getMetadata(user, mintAccount, cluster, authensusResult.complete);
        const timestamps = await getTimestamps(cluster, mintAccount, 2);    // There shouldn't be more than 2 transactions on a given mint

        // Actually of type ConfirmedSignatureInfo
        const timestamp = customMetadata ?
            timestamps.find((ts) => ts.signature === customMetadata.nftData.creationTransaction) : 
            timestamps[0];

        // verifyAgreement(authensusResult, solanaMetadata);

        const result: StoredResult = {
            user:           user,
            mint:           mintAccount,
            creationTx:     customMetadata ? customMetadata.nftData.creationTransaction : timestamps[0].signature,
            name:           solanaMetadata.name,
            location:       customMetadata ? customMetadata.irysFileLocation : null,
            metadataLoc:    customMetadata ? solanaMetadata.uri : null,
            hash:           customMetadata ? customMetadata.data.fileHash : null,
            timestamp:      timestamp.blockTime,
            size:           customMetadata ? customMetadata.data.fileSizeBytes : null,
            complete:       customMetadata ? true : false,
        };

        return result;
    } catch(error) {
        throw new Error(`Error while getting results: ${error}`);
    }
}

export async function getFilesByHash(
    hash: string
): Promise<StoredResult[]> {
    const response = await axios.get(`${BACKEND_URL}/hashes/${hash}`);

    if (response.status === 200) {
        return await convertToResults(response.data);
    } else {
        throw new Error(`Error while fetching by hash: ${response.status}`);
    }
}

// Shouldn't ever be a problem but will keep it here for now as a sanity check
function verifyAgreement(
    authensusResult: AuthensusResult,
    customMetadata: any
) {
    if(authensusResult.mintSignature !== customMetadata.nftData.creationTransaction){
        throw new Error(`The result is different from the posted metadata! Mint Tx ${authensusResult.mintSignature} != ${customMetadata.nftData.creationTransaction}`);
    }
    if(authensusResult.fileInfo.fileHash !== customMetadata.data.fileHash){
        throw new Error(`The result is different from the posted metadata! File Hash ${authensusResult.fileInfo.fileHash} != ${customMetadata.data.fileHash}`);
    }
    if(authensusResult.fileInfo.fileSize !== customMetadata.data.fileSizeBytes){
        throw new Error(`The result is different from the posted metadata! File Size ${authensusResult.fileInfo.fileSize} != ${customMetadata.data.fileSizeBytes}`);
    }
}

async function convertToResults(responses): Promise<StoredResult[]> {
    let result = [];
    try{
        responses.forEach(response => {
            result.push({
                user:           response.user,
                mint:           response.mint,
                creationTx:     response.creationTx,
                name:           response.name,
                location:       response.location,
                metadataLoc:    response.metadataLoc,
                hash:           response.hash,
                timestamp:      response.timestamp,
                size:           response.size,
                complete:       response.complete,
            } as StoredResult);
        });

        return result;
    } catch(err) {
        throw new Error(`Error while converting to Result: ${err.message}`);
    }
}

/*
    MPL Token Metadata structure:
        key: Key;
        updateAuthority: PublicKey;
        mint: PublicKey;
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
        creators: Option<Array<Creator>>;
        primarySaleHappened: boolean;
        isMutable: boolean;
        editionNonce: Option<number>;
        tokenStandard: Option<TokenStandard>;
        collection: Option<Collection>;
        uses: Option<Uses>;
        collectionDetails: Option<CollectionDetails>;
        programmableConfig: Option<ProgrammableConfig>;
*/
