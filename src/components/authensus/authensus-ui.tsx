'use client';

import { useCluster } from '../cluster/cluster-data-access'
import { MintRpcObject } from '../nft_builder/mint/mint-data-access'
import { useState } from 'react'
import { useAnchorProvider } from '../solana/solana-provider'
import { useAuthensusFunctionality } from './authensus-functionality'
import * as anchor from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

export function AuthensusCreate(
  {name, symbol, uri, wallet, verified, share}:
  {name: string, symbol: string, uri: string, wallet: WalletContextState, verified: boolean, share: number}
) {

  const { cluster } = useCluster();
  const provider = useAnchorProvider();

  const [buttonText, setButtonText] = useState<string>("Authensise");

  const { authensise } = useAuthensusFunctionality();

  // Only ever one creator
  const creators: [{address: anchor.web3.PublicKey, verified: boolean, share: number}] = 
  [
    {
      address: wallet.publicKey,
      verified: verified,
      share: share
    }
  ];

  const mintRpcObj: MintRpcObject = {
    name: name,
    symbol: symbol,
    uri: uri,
    creators: creators
  }

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => authensise.mutateAsync({ mintRpcObj, wallet, cluster, provider })}
      disabled={authensise.isPending}
    >
      {buttonText}{authensise.isPending && "..."}
    </button>
  );
}
