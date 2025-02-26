'use client';

import { NFT_BUILDER_PROGRAM_ID as programId, getNftBuilderProgram } from "../../../../anchor/src"//'@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useCluster } from '../../cluster/cluster-data-access'
import { useAnchorProvider } from '../../solana/solana-provider'
import { useTransactionToast } from '../../ui/ui-layout'
import * as anchor from "@coral-xyz/anchor"

export const mint: anchor.web3.PublicKey = anchor.web3.PublicKey.default;

export function setMint(address: string) {
  return new anchor.web3.PublicKey(address);
}

export const mintTransaction: string = "";

export function setMintTransaction(hash: string) {
  return hash;
}

export function useNftBuilderProgramEdit(
  { payer }:
  { payer: anchor.web3.PublicKey }
) {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getNftBuilderProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const edit = useMutation<string, Error, any>({
    mutationKey: ['edit', { cluster }],
    mutationFn: ({ newUri }) => program.methods.edit(newUri)
      .accounts(
        {
          payer: payer,
          mintAccount: mint,
        }
      )
      .signers(
        []
      )
      .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (err) => toast.error(`Failed to run the Edit Program: ${err.message}`),
  });

  return {
    program,
    programId,
    getProgramAccount,
    edit
  };
}
