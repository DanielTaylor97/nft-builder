import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    signerIdentity,
    publicKey
} from '@metaplex-foundation/umi'
import {
    fetchDigitalAsset,
    mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata'
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { type PublicKey, ConfirmedSignatureInfo, Connection } from '@solana/web3.js'
import { Cluster } from '../../../components/cluster/cluster-data-access'

export async function getMetadata(
    user: PublicKey,
    mint: PublicKey,
    cluster: Cluster
) {
    try {
        // Create the umi instance
        const umi = createUmi(cluster.endpoint);

        // Use the MPL Token Metadata plugin
        umi.use(mplTokenMetadata());

        // Use the wallet as a signer for umi txs
        const signer = {
            publicKey: fromWeb3JsPublicKey(user),
            signTransaction: async (tx) => tx,
            signMessage: async (data) => data,
            signAllTransactions: async (txs) => txs,
        };
        umi.use(signerIdentity(signer));

        // Convert to umi pubkey
        const mintAddress = publicKey(mint.toString());

        const asset = await fetchDigitalAsset(umi, mintAddress);
        // Can also get mint, publicKey and (optional) edition
        const solanaMetadata = asset.metadata;

        // Fetch the metadata URI (in our case from Irys gateway)
        const response = await fetch(asset.metadata.uri);
        const customMetadata = await response.json();

        return {
            solanaMetadata,
            customMetadata
        }
    } catch(error) {
        throw new Error(`Error while fetching metadata: ${error}`);
    }
}

/// Gets the transaction list for the provided accounts -- intended to be used to fetch mint account histories for timestamps.
/// Ordered by transaction timestamp.
export async function getTimestamps(
    cluster: Cluster,
    account: PublicKey,
    numTx: number
): Promise<ConfirmedSignatureInfo[]> {
    try {
        const solanaConnection = new Connection(cluster.endpoint);
        const transactionList = await solanaConnection.getSignaturesForAddress(account, {limit: numTx});

        return orderTransactionList(transactionList);
    } catch(error) {
        throw new Error(`Error while getting the timestamps: ${error}`);
    }
}

function orderTransactionList(list: ConfirmedSignatureInfo[]): ConfirmedSignatureInfo[] {
    return list.toSorted((a, b) => a.blockTime - b.blockTime);
}
