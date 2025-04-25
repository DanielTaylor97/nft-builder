'use client';

import { useWalletUi } from '@wallet-ui/react';

import CollectionGrid from './collection-ui'
import { WalletButton } from '../solana/solana-provider';
import { AppHero } from '../app-hero'
import { ellipsify } from '../lib/utils'
import { ExplorerLink } from '../cluster/cluster-ui'
import { PublicKey } from '@solana/web3.js';

export default function AuthensusFeature() {

  const wallet = useWalletUi();

  if (wallet.account?.address) {

    const pk = new PublicKey(wallet.account.address);

    return (
      <div>
        <div>
          <AppHero
            title="Collection"
            subtitle={
                <div className="my-4">
                    <ExplorerLink address={wallet.account?.address} label={ellipsify(wallet.account?.address)} />
                </div>
            }
          >
            <CollectionGrid user={pk} />
          </AppHero>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
