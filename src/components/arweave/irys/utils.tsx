
import { WebUploader } from "@irys/web-upload"
import { WebSolana } from "@irys/web-upload-solana"
import { BaseWebIrys } from "@irys/web-upload/dist/types/base";
import type { FundResponse, UploadResponse } from '@irys/upload-core/dist/types/types'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Cluster, ClusterNetwork } from '../../cluster/cluster-data-access'
import fs from 'fs';
import { type BigNumber, BigNumber as BN } from 'bignumber.js';

const BIG_NUMBER_ZERO = new BN(0);

export const getIrys = async (
    cluster: Cluster,
    wallet: WalletContextState
): Promise<BaseWebIrys> => {

    try {

        if(cluster.endpoint === ClusterNetwork.Devnet) {
            const irysUploader = await WebUploader(WebSolana)
                                        .withProvider(wallet)
                                        .withRpc(cluster.endpoint)
                                        .devnet();

            return irysUploader;
        } else {
            const irysUploader = await WebUploader(WebSolana)
                                        .withProvider(wallet);
    
            return irysUploader;
        }
    } catch (error) {
        throw new Error(`Error while creating the Irys instance: ${error.message}`);
    }
};

const fundsNeeded = async (
    irysInstance: BaseWebIrys,
    cost: BigNumber
): Promise<BigNumber> => {
    try {
        const initialBalance = await getIrysBalance(irysInstance);
        const fundingAmount = (initialBalance > cost) ? BIG_NUMBER_ZERO : cost.minus(initialBalance);

        return fundingAmount;
    } catch(error) {
        throw new Error(`Error while calculating funds needed: ${error}`);
    }
}

export const getIrysBalance = async (irysInstance: BaseWebIrys): Promise<BigNumber> => {
    try {
        const balance = irysInstance.getBalance();

        // In atomic units
        return balance;
    } catch (error) {
        throw new Error(`Error while getting the balance: ${error.message}`);
    }
}

export const upfrontFundNodeConditional = async (
    irysInstance: BaseWebIrys,
    cost: BigNumber,
): Promise<FundResponse | boolean> => {
    try{
        const fundingAmount = await fundsNeeded(irysInstance, cost);
        if (fundingAmount.isGreaterThan(BIG_NUMBER_ZERO)) {
            const fundTx = await upfrontFundNode(irysInstance, fundingAmount);

            return fundTx;
        }

        return true;

    } catch(error) {
        throw new Error(`Error funding the node conditionally: ${error.message}`);
    }
};

export const upfrontFundNode = async (
    irysInstance: BaseWebIrys,
    amount: BigNumber,
): Promise<FundResponse> => {
    try{
        const fundTx = await irysInstance.fund(amount, 1.2);

        return fundTx;
    } catch(error) {
        throw new Error(`Error funding the node: ${error.message}`);
    }
};

export const lazyFundNode = async (
    irysInstance: BaseWebIrys,
    pathToFile: string,
): Promise<FundResponse> => {
    try{
        const { size } = await fs.promises.stat(pathToFile);
        const price = await irysInstance.getPrice(size);
        const fundTx = await irysInstance.fund(price);

        return fundTx;
    } catch(error) {
        throw new Error(`Error funding the node: ${error}`);
    }
}

export const uploadData = async (
    irysInstance: BaseWebIrys,
    dataToUpload: string,
    tags: {name: string, value: string}[]
): Promise<UploadResponse> => {

    try {
        const receipt = await irysInstance.upload(dataToUpload, { tags: tags });
        
        return receipt;
    } catch(error) {
        throw new Error(`Error uploading data to Irys: ${error.message}`);
    }
}

export const uploadFile = async (
    irysInstance: BaseWebIrys,
    file: File,
    tags: {name: string, value: string}[]
): Promise<UploadResponse> => {
    try {
        const receipt = await irysInstance.uploadFile(file, { tags: tags });
        
        return receipt;
    } catch (error) {
        const balance = irysInstance.utils.fromAtomic(await irysInstance.getBalance());
        const cost = irysInstance.utils.fromAtomic(await irysInstance.getPrice(file.size));
        throw new Error(`Error uploading file to Irys: ${error.message}. Balance: ${balance}; cost: ${cost}`);
    }
};
