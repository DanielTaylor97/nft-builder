// import { request } from 'urllib';
import { genericThumbnail } from './thumbnail';
import { getFileBuffer } from '../../app/api/collection/results';

export async function createThumbnailFromUrl(url: string, type: string) {
    try {
        const data = await getFileBuffer(url) as Buffer;

        return await genericThumbnail(data, type);
    } catch(error) {
        throw new Error(`Error while creating the thumbnail: ${error.message}`);
    }
}
