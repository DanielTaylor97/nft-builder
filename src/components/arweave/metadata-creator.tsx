export const metadata = (
    tokenCreationSignature: string,
    fileType: string,
    fileSizeKb: number,
    fileHash: string,
    fileLocation: string,
    // nftTimestamp: string,
    creator: string
) => {
    const metadataStr: string = 
`"root": {
    "irysFileLocation": "${fileLocation}",
    "data": {
        "type": "${fileType}",
        "fileSizeBytes": "${fileSizeKb}",
        "fileHash": "${fileHash}",
    },
    "nftData": {
        "creationTransaction": "${tokenCreationSignature}",
        "creatorAccount": "${creator}",
    }
}`;
    // "timestamp": "${nftTimestamp}",

    return metadataStr;

}