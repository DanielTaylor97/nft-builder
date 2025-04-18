'use client';

import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'

import { StoredResult, getFilesByHash } from '../../app/api/collection/results'
import keccak256 from 'keccak256';
import { useCallback, useEffect, useState } from 'react';

export function useSearchFiles({ setCollection, setSearchError }){

    const handleFileSearch = useCallback(async (file) => {

        let hash;

        const fileHash = async () => {
            try{
                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const fileHash = keccak256(fileBuffer).toString('hex');

                hash = fileHash;

                const result = await getFilesByHash(hash);
                setCollection(result);
            } catch(error) {
                setSearchError(error);
            }
        }

        fileHash();
    },
    []);
    
    const handleHashSearch = useCallback(async (hash) => {

        const fileHash = async () => {
            try{
                const result = await getFilesByHash(hash);
                setCollection(result);
            } catch (error) {
                setSearchError(error);
            }
        }

        fileHash();

    },
    []);

    return { handleFileSearch, handleHashSearch };
}

export function useSearch({ hash }) {

    const history = useQuery({
        queryKey: ['get-hash-results', { endpoint: null, hash: hash }],
        queryFn: () => getFilesByHash(hash),
    });

    return history;
}
