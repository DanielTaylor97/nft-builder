'use client';

import { useCluster } from '../cluster/cluster-data-access'
import { useState } from 'react'
import { useAnchorProvider } from '../solana/solana-provider'
import { useAuthensusFunctionality } from './authensus-functionality'
import FileDrop from '../filedrop/file-drop'
import { WalletContextState } from '@solana/wallet-adapter-react'

export function AuthensusCreate(
  { wallet }:
  { wallet: WalletContextState }
) {

  const { cluster } = useCluster();
  const provider = useAnchorProvider();

  const [buttonText, setButtonText] = useState<string>("Authensise");
  const [files, setFiles] = useState([]);

  const { authensise } = useAuthensusFunctionality();

  return (
    <div>
      <div>
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => authensise.mutateAsync({ files, wallet, cluster, provider })}
          disabled={authensise.isPending}
        >
          {buttonText}{authensise.isPending && "..."}
        </button>
      </div>
      <div>
        <FileDrop onFilesSelected={setFiles} width="300px" height="400px" />
      </div>
    </div>
  );
}
