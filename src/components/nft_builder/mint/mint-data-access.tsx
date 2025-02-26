'use client';

import { NFT_BUILDER_PROGRAM_ID as programId, getNftBuilderProgram } from "../../../../anchor/src"//'@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { setMint, setMintTransaction } from '../edit/edit-data-access'
import { useCluster } from '../../cluster/cluster-data-access'
import { useAnchorProvider } from '../../solana/solana-provider'
import { useTransactionToast } from '../../ui/ui-layout'
import * as anchor from "@coral-xyz/anchor"

export function useNftBuilderProgramMint(
  {name, symbol, uri, creators}:
  {name: string, symbol: string, uri: string, creators: [{address: anchor.web3.PublicKey, verified: boolean, share: number}]}
)
{

  // Create a new account keypair as the mint -- I think this should just work??
  const mintKeypair = anchor.web3.Keypair.generate();

  setMint(mintKeypair.publicKey.toString());
  
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getNftBuilderProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const mint = useMutation({
    mutationKey: ['mint', { cluster }],
    mutationFn: () => program.methods.mint(name, symbol, uri, creators)
      .accounts(
        {
          payer: creators[0].address,
          mintAccount: mintKeypair.publicKey,
        }
      )
      .signers(
        [mintKeypair]
      )
      .rpc(),
    onSuccess: (signature) => {
      setMintTransaction(signature);
      transactionToast(signature);
    },
    onError: (err) => toast.error(`Failed to run the Mint Program: ${err.message}`),
  });

  return {
    program,
    programId,
    getProgramAccount,
    mint
  };
}
