'use client';

import { getFilesByHash } from '../../app/api/collection/results'
import keccak256 from 'keccak256';
import { useCallback } from 'react';

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
