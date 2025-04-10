/**
 * IPFS Image Upload Module for tama.meme Platform
 * 
 * This module provides functionality to upload token images to IPFS
 * through the tama.meme API.
 */

import { API, TOKEN_CREATION } from '../shared/constants';
import { TokenCreationError, TokenCreationErrorType, parseUploadError } from '../utils/errorHandling';

/**
 * Validates an image file before uploading
 * 
 * @param imageFile - The image file to validate
 * @throws TokenCreationError if validation fails
 */
function validateImageFile(imageFile: File): void {
  // Check if file is provided
  if (!imageFile) {
    throw new TokenCreationError(
      TokenCreationErrorType.UPLOAD_FAILED,
      'No image file provided',
      null
    );
  }

  // Check file size
  if (imageFile.size > TOKEN_CREATION.MAX_IMAGE_SIZE) {
    throw new TokenCreationError(
      TokenCreationErrorType.UPLOAD_FAILED,
      `Image file is too large (${(imageFile.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 1MB.`,
      null
    );
  }

  // Check file type
  const fileType = imageFile.type.toLowerCase();
  if (!fileType.startsWith('image/')) {
    throw new TokenCreationError(
      TokenCreationErrorType.UPLOAD_FAILED,
      `Invalid file type: ${fileType}. Please upload an image file.`,
      null
    );
  }
}

/**
 * Uploads an image file to IPFS through the tama.meme API
 * 
 * @param imageFile - The image file to upload (from file input)
 * @returns Promise resolving to the IPFS URL of the uploaded image
 * @throws TokenCreationError if upload fails
 * 
 * @example
 * ```typescript
 * // In a React component with a file input
 * const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (!file) return;
 *   
 *   try {
 *     const ipfsUrl = await uploadImageToIPFS(file);
 *     console.log('Image uploaded to IPFS:', ipfsUrl);
 *   } catch (error) {
 *     console.error('Upload failed:', error.message);
 *   }
 * };
 * ```
 */
export async function uploadImageToIPFS(imageFile: File): Promise<string> {
  try {
    // Validate the image file
    validateImageFile(imageFile);
    
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', imageFile);

    console.log('Uploading image to IPFS...');
    
    // Make request to tama.meme upload API
    const response = await fetch(API.IPFS_UPLOAD, {
      method: 'POST',
      body: formData,
      // The API requires authentication
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new TokenCreationError(
        TokenCreationErrorType.UPLOAD_FAILED,
        `Upload failed: ${response.status} ${response.statusText}. ${errorText}`,
        response
      );
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new TokenCreationError(
        TokenCreationErrorType.UPLOAD_FAILED,
        'Upload succeeded but no image URL was returned',
        data
      );
    }
    
    console.log('Image successfully uploaded to IPFS!');
    console.log(`IPFS URL: ${data.imageUrl}`);
    
    return data.imageUrl;
  } catch (error) {
    // If the error is already a TokenCreationError, just rethrow it
    if (error instanceof TokenCreationError) {
      throw error;
    }
    
    // Otherwise, parse the error and throw a TokenCreationError
    throw parseUploadError(error);
  }
} 