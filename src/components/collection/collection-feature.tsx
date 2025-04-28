'use client';

import { useWallet } from '@solana/wallet-adapter-react';

import CollectionGrid from './collection-ui'
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui'

export default function AuthensusFeature() {

  const wallet = useWallet();

  if (wallet.publicKey) {

    return (
      <div>
        <div>
          <AppHero
            title="Collection"
            subtitle={
                <div className="my-4">
                    <ExplorerLink path={`account/${wallet.publicKey}`} label={ellipsify(wallet.publicKey.toString())} />
                </div>
            }
          >
            <CollectionGrid user={wallet.publicKey} />
          </AppHero>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
