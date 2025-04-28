import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { signerIdentity, publicKey } from '@metaplex-foundation/umi'
import { fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { type PublicKey, ConfirmedSignatureInfo, Connection } from '@solana/web3.js'

import { TEMP_URI } from '../../../components/authensus/authensus-functionality'

export async function getMetadata(
    user: PublicKey,
    mint: PublicKey,
    cluster,
    expectComplete: Boolean,
) {
    const maxTries = expectComplete ? 120 : 1;
    const waitTime = 500;   // in ms

    try {
        let solanaMetadata;
        let customMetadata;

        for(let i = 0; i < maxTries; i++){
            // Create the umi instance
            const umi = createUmi(cluster.cluster);
    
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
            // const mintAddress = publicKey("GRqchwbnYkexzbdG9yqAufD7J9XYu4JWwoaa8Vy6Eu77");
            const mintAddress = publicKey(mint.toString());

            const asset = await fetchDigitalAsset(umi, mintAddress);
            // Can also get mint, publicKey and (optional) edition
            solanaMetadata = asset.metadata;

            if(asset.metadata.uri === TEMP_URI) {
                customMetadata = null;
                if(expectComplete) {
                    await delay(waitTime) // If we're expecting that everything is complete, wait and try again
                } else {
                    break;
                }
            } else {
                // Fetch the metadata URI (in our case from Irys gateway)
                const response = await fetch(asset.metadata.uri);
                customMetadata = await response.json();
                break;
            }
        }

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
    cluster,
    account: PublicKey,
    numTx: number
): Promise<ConfirmedSignatureInfo[]> {
    try {
        const solanaConnection = new Connection(cluster.cluster);
        const transactionList = await solanaConnection.getSignaturesForAddress(account, {limit: numTx});

        return orderTransactionList(transactionList);
    } catch(error) {
        throw new Error(`Error while getting the timestamps: ${error}`);
    }
}

function orderTransactionList(list: ConfirmedSignatureInfo[]): ConfirmedSignatureInfo[] {
    return list.toSorted((a, b) => a.blockTime - b.blockTime);
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
}
