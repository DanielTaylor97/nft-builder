
import { WebUploader } from "@irys/web-upload"
import { WebSolana } from "@irys/web-upload-solana"
import { BaseWebIrys } from "@irys/web-upload/dist/types/base";
import type { FundResponse, UploadResponse } from '@irys/upload-core/dist/types/types'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Cluster, ClusterNetwork } from '../../cluster/cluster-data-access'
import fs from 'fs';

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

export const upfrontFundNode = async (
    irysInstance: BaseWebIrys,
    amount: number,
): Promise<FundResponse> => {
    try{
        const fundTx = await irysInstance.fund(irysInstance.utils.toAtomic(amount));
        console.log(`Successfully funded ${irysInstance.utils.fromAtomic(fundTx.quantity)}${irysInstance.token}`);
        return fundTx;
    } catch(err) {
        console.log("Error funding the node: ", err);
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
    } catch(err) {
        console.log("Error funding the node: ", err);
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
        console.log(`File uploaded to https://gateway.irys.xyz/${receipt.id}`);
        return receipt;
    } catch (error) {
        throw new Error(`Error uploading file to Irys: ${error.message}`);
    }
};
