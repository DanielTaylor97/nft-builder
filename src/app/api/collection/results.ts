import { type PublicKey } from '@solana/web3.js'

import { getMetadata, getTimestamps } from './metadata'
import { Cluster } from '../../../components/cluster/cluster-data-access'
import { type AuthensusResult } from '../../../components/authensus/authensus-functionality'


export type StoredResult = {
    mint: PublicKey;
    creationTx: string;
    location: string;
    metadataLoc: string;
    hash: string;
    timestamp: number;
    size: number;
}

export async function getHistoricResults(
    user: PublicKey
) {
    //
}

export async function getResults(
    user: PublicKey,
    authensusResult: AuthensusResult,
    cluster: Cluster,
): Promise<StoredResult> {
    try {
        const mintAccount = authensusResult.mintKeypair.publicKey;

        const { solanaMetadata, customMetadata } = await getMetadata(user, mintAccount, cluster);
        const timestamps = await getTimestamps(cluster, mintAccount, 2);    // There shouldn't be more than 2 transactions on a given mint

        // Actually of type ConfirmedSignatureInfo
        const timestamp = timestamps.find((ts) => ts.signature === customMetadata.creationTransaction);

        verifyAgreement(authensusResult, solanaMetadata);

        const result: StoredResult = {
            mint: mintAccount,
            creationTx: customMetadata.creationTransaction,
            location: customMetadata.irysFileLocation,
            metadataLoc: solanaMetadata.uri,
            hash: customMetadata.fileHash,
            timestamp: timestamp.blockTime,
            size: customMetadata.fileSizeBytes
        };

        return result;
    } catch(error) {
        throw new Error(`Error while getting results: ${error}`);
    }
}

// Shouldn't ever be a problem but will keep it here for now as a sanity check
function verifyAgreement(
    authensusResult: AuthensusResult,
    customMetadata: any
) {
    if(authensusResult.mintSignature !== customMetadata.creationTransaction){
        throw new Error(`The result is different from the posted metadata! Mint Tx ${authensusResult.mintSignature} != ${customMetadata.creationTransaction}`);
    }
    if(authensusResult.fileInfo.fileHash !== customMetadata.fileHash){
        throw new Error(`The result is different from the posted metadata! File Hash ${authensusResult.fileInfo.fileHash} != ${customMetadata.fileHash}`);
    }
    if(authensusResult.fileInfo.fileSize !== customMetadata.fileSizeBytes){
        throw new Error(`The result is different from the posted metadata! File Size ${authensusResult.fileInfo.fileSize} != ${customMetadata.fileSizeBytes}`);
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
