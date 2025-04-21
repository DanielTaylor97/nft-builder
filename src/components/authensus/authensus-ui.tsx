'use client';

import { useState, useCallback, useMemo } from 'react'
import { FileDrop } from '../filedrop/file-drop'
import { WalletContextState } from '@solana/wallet-adapter-react'
import AuthensusButton, { EMPTY_RESULT, type AuthensusResult } from './authensus-functionality'
import { addNewResults } from '../../app/api/collection/results'
import { useCluster } from '../cluster/cluster-data-access'

const EMPTY_FILES: File[] = [];

export function AuthensusCreate(
  { wallet }:
  { wallet: WalletContextState }
) {
    
  const { cluster } = useCluster();

  const [files, setFiles] = useState<File[]>(EMPTY_FILES);
  const [result, setResult] = useState<AuthensusResult>(EMPTY_RESULT);

  useMemo(
    () => {
      if (result.complete) {
        addNewResults(wallet.publicKey, result, cluster);
      }
    },
    [result.complete]
  );

  const clearFiles = useCallback(
    () => setFiles(EMPTY_FILES),
    []
  );

  return (
    <div>
      <div>
        <AuthensusButton files={files} wallet={wallet} initResult={result} cluster={cluster} onResult={setResult} />
      </div>
      <></>
      <div>
        <FileDrop onFilesSelected={setFiles} onFilesClear={clearFiles} onSetResult={setResult} authensusComplete={result.complete} width="300px" height="350px" />
      </div>
    </div>
  );
}
