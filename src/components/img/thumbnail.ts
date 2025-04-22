


export function genericThumbnail(file: File) {
    const fileType = file.type;

    switch (fileType) {
        case "image/png":
            
            return imgThumbnail(file);
    
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

function imgThumbnail(file) {
    //
}

