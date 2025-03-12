import { getMetadata, getTimestamps } from './metadata'
import { type PublicKey } from '@solana/web3.js'
import { Cluster } from '../../../components/cluster/cluster-data-access'

export type StoredResult = {
    mint: PublicKey;
    creationTx: string;
    location: string;
    metadataLoc: string;
    hash: string;
    timestamp: number;
    size: number;
}

export async function getResults(
    user: PublicKey,
    mintAccount: PublicKey,
    cluster: Cluster,
): Promise<StoredResult> {
    try {
        const { solanaMetadata, customMetadata } = await getMetadata(user, mintAccount, cluster);
        const timestamps = await getTimestamps(cluster, mintAccount, 2);    // There shouldn't be more than 2 transactions on a given mint

        // Actually of type ConfirmedSignatureInfo
        const timestamp = timestamps.find((ts) => ts.signature === customMetadata.creationTransaction);

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
