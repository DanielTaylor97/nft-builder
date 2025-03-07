'use client';

import { useState, useCallback } from 'react'
import FileDrop from '../filedrop/file-drop'
import { WalletContextState } from '@solana/wallet-adapter-react'
import AuthensusButton, { type AuthensusResult } from './authensus-functionality'

const EMPTY_FILES: File[] = [];

export function AuthensusCreate(
  { wallet }:
  { wallet: WalletContextState }
) {

  const [files, setFiles] = useState<File[]>(EMPTY_FILES);
  const [result, setResult] = useState<AuthensusResult>();

  const clearFiles = useCallback(
    () => setFiles(EMPTY_FILES),
    []
  );

  return (
    <div>
      <div>
        <AuthensusButton files={files} wallet={wallet} onResult={setResult} />
      </div>
      <div>
        <FileDrop onFilesSelected={setFiles} onFilesClear={clearFiles} authensusComplete={result.editSignature !== ""} width="300px" height="400px" />
      </div>
    </div>
  );
}
