'use client';

import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'

import { StoredResult, getHistoricResults } from '../../app/api/collection/results'

export function useGetMetadata({ user }: { user: PublicKey }): UseQueryResult<StoredResult[], Error> {

    const history = useQuery({
        queryKey: ['get-historic-results', { endpoint: null, address: user }],
        queryFn: () => getHistoricResults(user),
    });

    return history;
}
