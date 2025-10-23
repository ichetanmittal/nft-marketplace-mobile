/**
 * Pinata IPFS Upload Utilities (Mobile)
 * Handles profile image uploads to IPFS for React Native
 */

import Constants from 'expo-constants'
import * as FileSystem from 'expo-file-system'
import * as FileSystemLegacy from 'expo-file-system/legacy'

const PINATA_JWT = Constants.expoConfig?.extra?.pinataJwt || process.env.EXPO_PUBLIC_PINATA_JWT
const PINATA_GATEWAY = Constants.expoConfig?.extra?.pinataGateway || process.env.EXPO_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud'

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  }
  return mimeTypes[extension || ''] || 'image/jpeg'
}

export interface PinataUploadResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
  gatewayUrl: string
}

/**
 * Upload image to Pinata IPFS
 * @param imageUri - Local file URI from image picker
 * @returns IPFS hash and gateway URL
 */
export async function uploadImageToPinata(imageUri: string): Promise<PinataUploadResponse> {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured. Please set EXPO_PUBLIC_PINATA_JWT in .env')
  }

  try {
    console.log('📤 Uploading image to Pinata IPFS...')

    // Get file name from URI
    const fileName = imageUri.split('/').pop() || 'profile-image.jpg'

    // Create form data
    const formData = new FormData()

    // Get correct MIME type
    const mimeType = getMimeType(imageUri)

    // React Native way: use file URI directly in FormData
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any)

    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: 'profile-image',
        uploadedAt: new Date().toISOString(),
      }
    })
    formData.append('pinataMetadata', metadata)

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const gatewayUrl = `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`

    console.log('✅ Image uploaded to IPFS:', gatewayUrl)

    return {
      IpfsHash: data.IpfsHash,
      PinSize: data.PinSize,
      Timestamp: data.Timestamp,
      gatewayUrl,
    }
  } catch (error) {
    console.error('Failed to upload to Pinata:', error)
    throw error
  }
}

/**
 * Validate image before upload
 */
export async function validateImage(imageUri: string): Promise<{
  valid: boolean
  error?: string
}> {
  try {
    const fileInfo = await FileSystemLegacy.getInfoAsync(imageUri)

    if (!fileInfo.exists) {
      return { valid: false, error: 'File does not exist' }
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (fileInfo.size && fileInfo.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is 5MB, got ${(fileInfo.size / (1024 * 1024)).toFixed(2)}MB`
      }
    }

    // Check file extension
    const extension = imageUri.split('.').pop()?.toLowerCase()
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']

    if (!extension || !validExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'Invalid file type. Supported: JPEG, PNG, GIF, WebP'
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    }
  }
}

/**
 * Get IPFS gateway URL from hash
 */
export function getIPFSUrl(ipfsHash: string): string {
  return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`
}

/**
 * Test Pinata connection
 */
export async function testPinataConnection(): Promise<boolean> {
  if (!PINATA_JWT) {
    console.error('Pinata JWT not configured')
    return false
  }

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    })

    if (response.ok) {
      console.log('✅ Pinata connection successful')
      return true
    } else {
      console.error('❌ Pinata connection failed:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Pinata connection error:', error)
    return false
  }
}
