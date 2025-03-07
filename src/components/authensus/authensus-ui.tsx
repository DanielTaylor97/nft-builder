'use client';

import { useCluster } from '../cluster/cluster-data-access'
import { useState, useCallback } from 'react'
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

  const clearFiles = useCallback(
    () => setFiles([]),
    []
  );

  return (
    <div>
      <div>
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => authensise.mutateAsync({ files, wallet, cluster, provider })}
          disabled={authensise.isPending || !files || files.length !== 1}
        >
          {buttonText}{authensise.isPending && "..."}
        </button>
      </div>
      <div>
        <FileDrop onFilesSelected={setFiles} onFilesClear={clearFiles} authensusComplete={authensise.isSuccess} width="300px" height="400px" />
      </div>
    </div>
  );
}
