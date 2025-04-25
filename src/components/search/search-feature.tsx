'use client';

// import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletUi } from '@wallet-ui/react'

import { FileSearcher } from './search-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '../lib/utils'
import { ExplorerLink } from '../cluster/cluster-ui'

export default function SearchFeature() {

    const wallet = useWalletUi();

    return (
        <div>
            <div>
                <AppHero
                    title="Search"
                    subtitle={
                        <div className="my-4">
                            <ExplorerLink address={wallet.account?.address} label={ellipsify(wallet.account?.address)} />
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
