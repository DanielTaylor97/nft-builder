// import pdf from 'pdf-thumbnail'
// import imageThumbnail from 'image-thumbnail'
import { readFileSync } from 'fs';

const IMG_THUMBNAIL_PATH = "./icons/pdf.png";
const PDF_THUMBNAIL_PATH = "./icons/pdf.png";
const PLAINTEXT_THUMBNAIL_PATH = "./icons/txt.png";
const VIDEO_THUMBNAIL_PATH = "./icons/vid.png";

export async function genericThumbnail(fileBuffer: Buffer, fileType: string): Promise<Buffer> {

    switch (fileType) {
        case "image/png":
            return imgThumbnail(fileBuffer);

        case "image/jpg":
            return imgThumbnail(fileBuffer);

        case "image/jpeg":
            return imgThumbnail(fileBuffer);
            
        case "application/pdf":
            return await pdfThumbnail(fileBuffer);

        case "text/plain":
            return plaintextThumbnail();

        case "text/csv":
            return plaintextThumbnail();

        case "text/html":
            return plaintextThumbnail();

        case "video/mp4":
            return videoThumbnail();

        case "video/mpeg":
            return videoThumbnail();

        case "video/webm":
            return videoThumbnail();
    
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

async function imgThumbnail(fileBuffer: Buffer): Promise<Buffer> {

    return readFileSync(IMG_THUMBNAIL_PATH);
    // try {
    //     const thumbnailData = await imageThumbnail(fileBuffer);

    //     /* ** Don't know why this doesn't work **
    //     const options = { height: 300 };
    //     const imageBuffer = fs.readFileSync("IMAGE_PATH");
    //     const thumbnail = await imageThumbnail(imageBuffer, options);
    //     */

    //     return thumbnailData;
    // } catch(error) {
    //     throw new Error(`Error while creating thumbnail from image: ${error.message}`);
    // }
}

async function pdfThumbnail(fileBuffer: Buffer): Promise<Buffer> {

    return readFileSync(PDF_THUMBNAIL_PATH);
    // try {
    //     const thumbnailStream = await pdf(fileBuffer, {
    //         resize: {
    //             width: 200,
    //             height: 300
    //         },
    //     });
        
    //     const thumbnailData = streamToBuffer(thumbnailStream);

    //     return thumbnailData;
    // } catch(error) {
    //     throw new Error(`Error while creating thumbnail from pdf: ${error.message}`);
    // }
}

function plaintextThumbnail(): Buffer {
    return readFileSync(PLAINTEXT_THUMBNAIL_PATH);
}

function videoThumbnail(): Buffer {
    return readFileSync(VIDEO_THUMBNAIL_PATH);
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    try {
        const encoding = "utf-8";

        return new Promise((resolve, reject) => {
            const chunks = [];

            stream.on("data", (data) => {
                if(typeof data === "string") {
                    chunks.push(Buffer.from(data, encoding));
                } else if(data instanceof Buffer) {
                    chunks.push(data);
                } else {
                    // Otherwise convert to JSON then to buffer
                    const jsonData = JSON.stringify(data);
                    chunks.push(Buffer.from(jsonData, encoding));
                }
            });

            stream.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            stream.on("error", reject);
        });
    } catch(error) {
        throw new Error(`Error while converting from stream to buffer: ${error.message}`);
    }
}
