'use client';

import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as anchor from "@coral-xyz/anchor"
import { useState, Dispatch, SetStateAction } from 'react'

import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { getIrys } from '../arweave/irys/utils'
import { MintRpcObject, runMintRpc } from '../nft_builder/mint/mint-data-access'
import { runEditRpc } from '../nft_builder/edit/edit-data-access'
import { uploadDataFn, createAndUploadMetadataPageFn, FileInfo } from '../arweave/arweave-data-access'
import { UploadResponse } from '@irys/upload-core/dist/types/types'
import { Cluster } from '../cluster/cluster-data-access'
import { WalletContextState } from '@solana/wallet-adapter-react'

export type AuthensusResult = {
    mintKeypair: anchor.web3.Keypair | null;
    mintSignature: string | null;
    dataUploadResult: UploadResponse | null;
    fileInfo: FileInfo | null;
    metadataUploadResult: UploadResponse | null;
    editSignature: string | null;
    complete: boolean;
};

export const EMPTY_RESULT: AuthensusResult = {
    mintKeypair: null,
    mintSignature: null,
    dataUploadResult: null,
    fileInfo: null,
    metadataUploadResult: null,
    editSignature: null,
    complete: false,
}

const AuthensusButton = (
    {files, wallet, initResult, onResult}:
    {files: File[], wallet: WalletContextState, initResult: AuthensusResult, onResult: Dispatch<SetStateAction<AuthensusResult>>}
): React.JSX.Element => {
    
    const { cluster } = useCluster();
    const provider = useAnchorProvider();

    const { authensise } = useAuthensusFunctionality();
    const [buttonText, setButtonText] = useState<string>("Authensise");

    function useAuthensusFunctionality() {
        const authensusToast = useTransactionToast();
        const authensise = useMutation<AuthensusResult, Error, any>({
            mutationFn: ({ files, wallet, cluster, provider }) => authensus({ files, wallet, cluster, provider }),
            onSuccess: (res) => {
                const sig = res.mintKeypair.publicKey.toString();
                setButtonText("Authensise");
                authensusToast(sig);
            },
            onError: (error) => {
                setButtonText("Authensise");
                toast.error(`Authensus process failed with error ${error}.`);
            },
        })
        return { authensise };
    }

    const authensus = async (
        { files, wallet, cluster, provider }:
        { files: [File], wallet: WalletContextState, cluster: Cluster, provider: anchor.AnchorProvider }
    ): Promise<AuthensusResult>  => {

        const file = files[0];
        const mintRpcObj = getFileInfo(file, wallet);

        const irysInstance = getIrys(cluster, wallet);

        // Cache the result state in case of failure midway
        let tempResult: AuthensusResult = initResult;

        try {
            if(!tempResult.mintSignature) {
                setButtonText("Minting");
                
                // Create a new account keypair as the mint -- every new file upload needs to have a new mint such that is the unique NFT of that mint
                const mintKeypair = anchor.web3.Keypair.generate();
    
                const mintSignature: string = await runMintRpc({
                    mintObj: mintRpcObj,
                    mintKeypair,
                    provider
                });
    
                tempResult = {
                    mintKeypair,
                    mintSignature,
                    dataUploadResult: null,
                    fileInfo: null,
                    metadataUploadResult: null,
                    editSignature: null,
                    complete: false
                };
            }
    
            if(!tempResult.dataUploadResult) {
                setButtonText("Storing");
    
                const { dataUploadResult, fileInfo }: { dataUploadResult: UploadResponse, fileInfo: FileInfo } = await uploadDataFn(irysInstance, file);
    
                tempResult = {
                    mintKeypair: tempResult.mintKeypair,
                    mintSignature: tempResult.mintSignature,
                    dataUploadResult,
                    fileInfo,
                    metadataUploadResult: null,
                    editSignature: null,
                    complete: false
                };
            }
    
            if(!tempResult.metadataUploadResult) {
                setButtonText("Metadata-ing");
    
                const metadataUploadResult: UploadResponse = await createAndUploadMetadataPageFn(
                    irysInstance,
                    tempResult.mintSignature,
                    tempResult.fileInfo,
                    `https://gateway.irys.xyz/${tempResult.dataUploadResult.id}`,
                    tempResult.mintKeypair.publicKey.toString(),
                    // nftTimestamp,
                    wallet.publicKey.toString()
                );
    
                tempResult = {
                    mintKeypair: tempResult.mintKeypair,
                    mintSignature: tempResult.mintSignature,
                    dataUploadResult: tempResult.dataUploadResult,
                    fileInfo: tempResult.fileInfo,
                    metadataUploadResult,
                    editSignature: null,
                    complete: false
                };
            }
    
            if(!tempResult.editSignature) {
                setButtonText("Editing");
    
                const newUri: string = `https://gateway.irys.xyz/${tempResult.metadataUploadResult.id}`;
    
                const editSignature = await runEditRpc({
                    payer: mintRpcObj.creators[0].address as anchor.web3.PublicKey,
                    mintAccount: tempResult.mintKeypair.publicKey,
                    newUri,
                    provider
                });
    
                tempResult = {
                    mintKeypair: tempResult.mintKeypair,
                    mintSignature: tempResult.mintSignature,
                    dataUploadResult: tempResult.dataUploadResult,
                    fileInfo: tempResult.fileInfo,
                    metadataUploadResult: tempResult.metadataUploadResult,
                    editSignature,
                    complete: true
                };
            }
            else {
                // If the edit signature already exists then something has gone wrong and we have not cleared the previous result
                throw new Error("The cached Authensus State seems not to have been cleared. Nothing to Update!");
            }
        } catch(err) {
            onResult(tempResult);
            throw(err);
        }

        onResult(tempResult);

        return tempResult;
    }

    return (
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => authensise.mutateAsync({ files, wallet, cluster, provider })}
          disabled={authensise.isPending || !files || files.length !== 1}
        >
          {buttonText}{authensise.isPending && "..."}
        </button>
    );
};

const getFileInfo = (file: File, wallet: WalletContextState): MintRpcObject => {
    try {
        const creators: [{address: anchor.web3.PublicKey, verified: boolean, share: number}] = 
        [
          {
            address: wallet.publicKey,
            verified: true,
            share: 100
          }
        ];

        const fileInfo: MintRpcObject = {
            name: file.name.length > 10 ? file.name.substring(0, 10) : file.name,
            symbol: symbolise(wallet.publicKey, file.name.length > 0 ? file.name : "file"),
            uri: "http://temp-uri.json",
            creators: creators
        }

        return fileInfo;
    } catch(error) {
        throw new Error(`Error while getting the file info: ${error.message}`)
    }
}

const symbolise = (
    user: anchor.web3.PublicKey,
    fileName: string
): string => {
    // User address is guaranteed to have length > 0
    const prefix = user.toString().substring(0, 3);

    const chars = charsOnly(fileName);
    const suffix = chars.length > 0 ? (chars.length > 3 ? chars.substring(0, 3).toUpperCase() : chars.toUpperCase()) : "FIL"

    return prefix + "-" + suffix;
}

const charsOnly = (str: string): string => {
    return str.split(".")[0].replace(/[^a-zA-Z0-9]/g, '');
}

export default AuthensusButton
