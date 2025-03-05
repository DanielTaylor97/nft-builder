'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero } from '../ui/ui-layout';
import { AuthensusCreate } from './authensus-ui';

export default function AuthensusFeature() {

  const wallet = useWallet();

  if (wallet.publicKey) {

    return (
      <div>
        <div>
          <AppHero
            title="Authensus"
            subtitle={"Add a file and Authensise it"}
          >
            <AuthensusCreate wallet={wallet} />
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
