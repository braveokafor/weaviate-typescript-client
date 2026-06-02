import { httpClient } from '../connection/http.js';

const isUrl = (file: string): file is string => {
  if (typeof file !== 'string') return false;
  try {
    const url = new URL(file);
    return !!url;
  } catch {
    return false;
  }
};

export const downloadImageFromURLAsBase64 = async (url: string): Promise<string> => {
  if (!isUrl(url)) {
    throw new Error('Invalid URL');
  }

  try {
    const client = httpClient({
      headers: { 'Content-Type': 'image/*' },
      host: '',
    });

    const response = await client.externalGet(url);

    if (typeof Buffer === 'undefined' || !Buffer.isBuffer(response)) {
      throw new Error('Response is not a buffer');
    }

    return response.toString('base64');
  } catch (error) {
    throw new Error(`Failed to download image from URL: ${url}`);
  }
};

const isBuffer = (file: string | Buffer): file is Buffer =>
  typeof Buffer !== 'undefined' && file instanceof Buffer;

const fileToBase64 = (file: string | Buffer): Promise<string> => {
  if (isBuffer(file)) return Promise.resolve(file.toString('base64'));
  if (typeof file === 'string' && isUrl(file)) return downloadImageFromURLAsBase64(file);
  return Promise.resolve(file as string);
};

export const toBase64FromMedia = (media: string | Buffer): Promise<string> => fileToBase64(media);
