'use client';

import { useWallet } from '@solana/wallet-adapter-react'

import { FileSearcher } from './search-ui'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'

export default function SearchFeature() {

    const wallet = useWallet();

    return (
        <div>
            <div>
                <AppHero
                    title="Search"
                    subtitle={
                        <div className="my-4">
                            <ExplorerLink path={`account/${wallet.publicKey}`} label={wallet.publicKey ? ellipsify(wallet.publicKey.toString()) : ""} />
                        </div>
                    }
                >
                    <FileSearcher />
                    {/* {wallet.publicKey && <UserSearcher user={wallet.publicKey} />} */}
                </AppHero>
            </div>
        </div>
    )
}
