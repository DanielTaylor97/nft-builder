'use client'

import { TOKEN_2022_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS } from 'gill/programs/token'
import { getTransferSolInstruction } from 'gill/programs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  UiWalletAccount,
  useWalletAccountTransactionSendingSigner,
  useWalletUi,
  useWalletUiCluster,
} from '@wallet-ui/react'
import {
  address,
  Address,
  airdropFactory,
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  Blockhash,
  createTransactionMessage,
  getBase58Decoder,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  SolanaClient,
  TransactionSendingSigner,
} from 'gill'
import { toast } from 'sonner'
import { useTransactionToast } from '../use-transaction-toast'

export function useGetBalance({ address }: { address: Address }) {
  const { cluster } = useWalletUiCluster()
  const { client } = useWalletUi()

  return useQuery({
    queryKey: ['get-balance', { cluster, address }],
    queryFn: () =>
      client.rpc
        .getBalance(address)
        .send()
        .then((res) => res.value),
  })
}

export function useGetSignatures({ address }: { address: Address }) {
  const { cluster } = useWalletUiCluster()
  const { client } = useWalletUi()

  return useQuery({
    queryKey: ['get-signatures', { cluster, address }],
    queryFn: () => client.rpc.getSignaturesForAddress(address).send(),
  })
}

export function useGetTokenAccounts({ address }: { address: Address }) {
  const { cluster } = useWalletUiCluster()
  const { client } = useWalletUi()

  return useQuery({
    queryKey: ['get-token-accounts', { cluster, address }],
    queryFn: async () =>
      Promise.all([
        client.rpc
          .getTokenAccountsByOwner(
            address,
            { programId: TOKEN_PROGRAM_ADDRESS },
            { commitment: 'confirmed', encoding: 'jsonParsed' },
          )
          .send()
          .then((res) => res.value ?? []),
        client.rpc
          .getTokenAccountsByOwner(
            address,
            { programId: TOKEN_2022_PROGRAM_ADDRESS },
            { commitment: 'confirmed', encoding: 'jsonParsed' },
          )
          .send()
          .then((res) => res.value ?? []),
      ]).then(([tokenAccounts, token2022Accounts]) => [...tokenAccounts, ...token2022Accounts]),
  })
}

export function useTransferSol({ address, account }: { address: Address; account: UiWalletAccount }) {
  const { cluster } = useWalletUiCluster()
  const { client } = useWalletUi()
  const toastTransaction = useTransactionToast()
  const txSigner = useWalletAccountTransactionSendingSigner(account, cluster.id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['transfer-sol', { cluster, address }],
    mutationFn: async (input: { destination: Address; amount: number }) => {
      try {
        const { signature } = await createTransaction({
          txSigner,
          destination: input.destination,
          amount: input.amount,
          client,
        })

        console.log(signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`)

        return
      }
    },
    onSuccess: (signature) => {
      if (signature?.length) {
        toastTransaction(signature)
      }
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['get-balance', { cluster, address }],
        }),
        queryClient.invalidateQueries({
          queryKey: ['get-signatures', { cluster, address }],
        }),
      ])
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`)
    },
  })
}

export function useRequestAirdrop({ address }: { address: Address }) {
  const { cluster } = useWalletUiCluster()
  const { client } = useWalletUi()
  const queryClient = useQueryClient()
  const toastTransaction = useTransactionToast()
  const airdrop = airdropFactory(client)

  return useMutation({
    mutationKey: ['airdrop', { cluster, address }],
    mutationFn: async (amount: number = 1) =>
      airdrop({
        commitment: 'confirmed',
        recipientAddress: address,
        lamports: lamports(BigInt(Math.round(amount * 1_000_000_000))),
      }),
    onSuccess: (signature) => {
      toastTransaction(signature)
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['get-balance', { cluster, address }] }),
        queryClient.invalidateQueries({ queryKey: ['get-signatures', { cluster, address }] }),
      ])
    },
  })
}

async function createTransaction({
  amount,
  destination,
  client,
  txSigner,
}: {
  amount: number
  destination: Address
  client: SolanaClient
  txSigner: TransactionSendingSigner
}): Promise<{
  signature: string
  latestBlockhash: {
    blockhash: Blockhash
    lastValidBlockHeight: bigint
  }
}> {
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(txSigner, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m) =>
      appendTransactionMessageInstruction(
        getTransferSolInstruction({
          amount,
          destination: address(destination),
          source: txSigner,
        }),
        m,
      ),
  )
  assertIsTransactionMessageWithSingleSendingSigner(message)

  const signature = await signAndSendTransactionMessageWithSigners(message)

  return {
    signature: getBase58Decoder().decode(signature),
    latestBlockhash,
  }
}

/*
import {TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID} from '@solana/spl-token'
import {useConnection, useWallet} from '@solana/wallet-adapter-react'
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {useTransactionToast} from '../ui/ui-layout'

export function useGetBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection()

  return useQuery({
    queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getBalance(address),
  })
}

export function useGetSignatures({ address }: { address: PublicKey }) {
  const { connection } = useConnection()

  return useQuery({
    queryKey: ['get-signatures', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getSignaturesForAddress(address),
  })
}

export function useGetTokenAccounts({ address }: { address: PublicKey }) {
  const { connection } = useConnection()

  return useQuery({
    queryKey: ['get-token-accounts', { endpoint: connection.rpcEndpoint, address }],
    queryFn: async () => {
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ])
      return [...tokenAccounts.value, ...token2022Accounts.value]
    },
  })
}

export function useTransferSol({ address }: { address: PublicKey }) {
  const { connection } = useConnection()
  const transactionToast = useTransactionToast()
  const wallet = useWallet()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['transfer-sol', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = ''
      try {
        const { transaction, legacyTransaction, latestBlockhash } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection,
        })

        // Send transaction and await for signature
        signature = await wallet.sendTransaction(legacyTransaction, connection)

        // Send transaction and await for signature
        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

        console.log(signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`, signature)

        return
      }
    },
    onSuccess: (signature) => {
      if (signature) {
        transactionToast(signature)
      }
      return Promise.all([
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
        }),
        client.invalidateQueries({
          queryKey: ['get-signatures', { endpoint: connection.rpcEndpoint, address }],
        }),
      ])
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`)
    },
  })
}

export function useRequestAirdrop({ address }: { address: PublicKey }) {
  const { connection } = useConnection()
  const transactionToast = useTransactionToast()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['airdrop', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (amount: number = 1) => {
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL),
      ])

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      return signature
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return Promise.all([
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
        }),
        client.invalidateQueries({
          queryKey: ['get-signatures', { endpoint: connection.rpcEndpoint, address }],
        }),
      ])
    },
  })
}

async function createTransaction({
  publicKey,
  destination,
  amount,
  connection,
}: {
  publicKey: PublicKey
  destination: PublicKey
  amount: number
  connection: Connection
}): Promise<{
  transaction: VersionedTransaction,
  legacyTransaction: Transaction,
  latestBlockhash: { blockhash: string; lastValidBlockHeight: number }
}> {
  // Get the latest blockhash to use in our transaction
  const latestBlockhash = await connection.getLatestBlockhash()

  // Create instructions to send, in this case a simple transfer
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destination,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  ]

  // Create a new TransactionMessage with version and compile it to legacy
  const messageLegacy = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToLegacyMessage()

  // Create a new VersionedTransaction which supports legacy and v0
  const transaction = new VersionedTransaction(messageLegacy)
  const legacyTransaction = Transaction.populate(messageLegacy);

  return {
    transaction,
    legacyTransaction,
    latestBlockhash,
  }
}
*/
