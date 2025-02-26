import WebIrys from "@Irys/sdk";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Cluster } from '../../cluster/cluster-data-access'
import fs from 'fs';
import { FundResponse, UploadResponse } from "@Irys/sdk/build/cjs/common/types";

export const getIrys = async (
    cluster: Cluster,
    solanaWallet: WalletContextState
): Promise<WebIrys> => {

    // Optional
    const rpcUrl = "";
    // const wallet = { rpcUrl: rpcUrl, name: "solana", provider: solanaWallet };

    const webIrys = new WebIrys({
        network: cluster.endpoint,
        token: "solana",
        // wallet
        key: process.env.PRIVATE_KEY,
        // config: { providerUrl }
    });

    await webIrys.ready();

    return webIrys;
};

export const upfrontFundNode = async (
    irysInstance: WebIrys,
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
    irysInstance: WebIrys,
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
    irysInstance: WebIrys,
    dataToUpload: string,
    tags: {name: string, value: string}[]
): Promise<UploadResponse> => {

    try {
        const receipt = await irysInstance.upload(dataToUpload, { tags: tags });
        console.log(`Data uploaded to https://gateway.irys.xyz/${receipt.id}`);
        return receipt;
    } catch(err) {
        console.log("Error uploading data: ", err);
    }
}

export const uploadFile = async (
    irysInstance: WebIrys,
    tempLoc: string,
    tags: {name: string, value: string}[]
): Promise<UploadResponse> => {
    try {
        const receipt = await irysInstance.uploadFile(tempLoc, { tags: tags });
        console.log(`File uploaded to https://gateway.irys.xyz/${receipt.id}`);
        return receipt;
    } catch (err) {
        console.log("Error uploading file: ", err);
    }
};
