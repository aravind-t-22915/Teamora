// src/services/storage.service.ts
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { IMAGE } from '../config/constants';

type ProgressCallback = (progress: number) => void;

/** Extract a Firebase Storage object path from a download URL. */
function pathFromDownloadURL(url: string): string {
  const match = url.match(/\/o\/(.+?)(\?|$)/);
  if (!match) throw new Error(`Cannot parse Firebase Storage URL: ${url}`);
  return decodeURIComponent(match[1]);
}

/** Resize and compress an image using expo-image-manipulator. */
async function compressImage(uri: string, width: number, quality: number): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

export const storageService = {
  /**
   * Compress image to IMAGE.MAX_WIDTH at IMAGE.COMPRESS_QUALITY,
   * upload to the given path, and return the public download URL.
   */
  async uploadImage(uri: string, path: string, onProgress?: ProgressCallback): Promise<string> {
    const compressedUri = await compressImage(uri, IMAGE.MAX_WIDTH, IMAGE.COMPRESS_QUALITY);
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    const storage = getStorage();
    const fileRef = ref(storage, path);
    return new Promise<string>((resolve, reject) => {
      const task = uploadBytesResumable(fileRef, blob);
      task.on(
        'state_changed',
        snapshot => {
          if (onProgress) {
            onProgress(snapshot.bytesTransferred / snapshot.totalBytes);
          }
        },
        reject,
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        },
      );
    });
  },

  /**
   * Compress image to IMAGE.THUMB_SIZE × IMAGE.THUMB_SIZE,
   * upload to the given path, and return the public download URL.
   */
  async uploadThumbnail(uri: string, path: string): Promise<string> {
    const compressedUri = await compressImage(uri, IMAGE.THUMB_SIZE, IMAGE.COMPRESS_QUALITY);
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    const storage = getStorage();
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytesResumable(fileRef, blob);
    return getDownloadURL(snapshot.ref);
  },

  /** Delete a file from Firebase Storage using its download URL. */
  async deleteFile(url: string): Promise<void> {
    const storage = getStorage();
    const path = pathFromDownloadURL(url);
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  },

  /** Exposed for external use when direct compression is needed. */
  compressImage,
};
