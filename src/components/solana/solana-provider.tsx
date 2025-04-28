'use client'

import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import {
  useConnection,
  useAnchorWallet,
} from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { createSolanaDevnet, createSolanaLocalnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react'
// import '@wallet-ui/tailwind/index.css'

export const WalletButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiDropdown, {
  ssr: false,
})
export const ClusterButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiClusterDropdown, {
  ssr: false,
})

const config = createWalletUiConfig({
  clusters: [createSolanaDevnet(), createSolanaLocalnet()],
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  return <WalletUi config={config}>{children}</WalletUi>
}

export function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()  // Not working for some reason

  return new AnchorProvider(connection, wallet as Wallet, { commitment: 'confirmed' })
}

/*
import dynamic from 'next/dynamic';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import {
  useConnection,
  useAnchorWallet,
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ReactNode, useCallback, useMemo } from 'react';
import { useCluster } from '../cluster/cluster-data-access';

require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletButton = dynamic(async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton, {
  ssr: false,
});

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const onError = useCallback((error: WalletError) => {
    console.error(error)
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()

  return new AnchorProvider(connection, wallet as Wallet, { commitment: 'confirmed' })
}
*/
