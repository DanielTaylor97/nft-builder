'use client';

import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'

import { StoredResult, getFileType, getHistoricResults } from '../../app/api/collection/results'

export function useGetMetadata(user: PublicKey): UseQueryResult<StoredResult[], Error> {

    const history = useQuery({
        queryKey: ['get-historic-results', { endpoint: null, address: user }],
        queryFn: () => getHistoricResults(user),
    });

    return history;
}

export function itemise(collectionData: StoredResult[] | null): Promise<{type: string;info: StoredResult;}>[] {
    try {
        if(collectionData) {
            const items = collectionData.map(async (item) => {
                const obj = {
                    type: await getFileType(item.metadataLoc),
                    info: item,
                };

                return obj;
            });

            return items;
        } else {
            return null;
        }
    } catch(error) {
        throw new Error(`Error while itemising: ${error.message}`);
    }
}
