export const metadata = (
    tokenCreationSignature: string,
    fileType: string,
    fileSizeKb: number,
    fileHash: string,
    fileLocation: string,
    // nftTimestamp: string,
    creator: string
) => {
    const metadataStr: string = `{
        "arweave-file-location": ${fileLocation},
        "data": {
            "type": ${fileType},
            "file-size-kb": ${fileSizeKb},
            "file-hash": ${fileHash},
        },
        "nft-data": {
            "creation-transaction": ${tokenCreationSignature},
            "creator-account": ${creator}
        }
    }`;
            // "timestamp": ${nftTimestamp},

    return metadataStr;

}