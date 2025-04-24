'use client';

import { useState } from 'react'
import { useMemo } from 'react'
import { IconRefresh } from '@tabler/icons-react'

import { itemise, useGetMetadata } from './collection-data-access'
import { PublicKey } from '@solana/web3.js';
import { TableComponent } from '../table/table';

export default function CollectionGrid(
    { user }:
    { user: PublicKey }
): JSX.Element {

    const collection = useGetMetadata(user);
    const [showAll, setShowAll] = useState(false);

    const items = useMemo(() => {
        const its = itemise(collection.data);
        if (showAll) return its;
        return its?.slice(0, 5)
    }, [collection.data, showAll])
    
    return (
        <div>
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Authensus History</h2>
                <div className="space-x-2">
                {collection.isLoading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <button className="btn btn-sm btn-outline" onClick={() => collection.refetch()}>
                    <IconRefresh size={16} />
                    </button>
                )}
                </div>
            </div>
            <TableComponent collection={collection} items={items} showAll={showAll} setShowAll={setShowAll} />
        </div>
    );
}
