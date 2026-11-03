// src/hooks/useImagePicker.ts
import * as ImagePicker from 'expo-image-picker';

/**
 * Wraps expo-image-picker (Expo SDK 57) for selecting images/videos
 * and taking photos. Handles permissions internally.
 *
 * All three methods return the first selected ImagePickerAsset, or null
 * if the user cancels or permission is denied.
 */
export function useImagePicker() {
  async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return null;
    return result.assets[0];
  }

  async function pickVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return null;
    return result.assets[0];
  }

  async function takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return null;
    return result.assets[0];
  }

  return { pickImage, pickVideo, takePhoto };
}
