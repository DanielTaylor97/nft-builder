'use client'

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WebUploader } from "@irys/web-upload"
import { WebSolana } from "@irys/web-upload-solana"

const getIrysUploader = async (wallet: any) => {
    try {
        const irysUploader = await WebUploader(WebSolana)
                                    .withProvider(wallet);

        return irysUploader;
    } catch(error) {
        throw new Error(`Error while instantiating the Irys Uploader: ${error.message}`);
    }
}

const ConnectIrys = (): JSX.Element => {
    const wallet = useWallet();
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const connectToIrys = async () => {
        if(!wallet) {
            console.log("Wallet not connected");
            return;
        }

        try {
            const irysUploader = getIrysUploader(wallet);

            setIsConnected(true);
        } catch (error) {
            throw new Error(`Error while connecting to Irys: ${error.message}`);
        }
    };

    return (
        <div>
            <button onClick={connectToIrys} disabled={isConnected}>
                {isConnected ? "Connected to Irys" : "Connect to Irys"}
            </button>
        </div>
    );
}
