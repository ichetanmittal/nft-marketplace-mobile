/**
 * Username Setup Screen (Mobile)
 * Second step - set username and upload profile picture
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import type { UserRole } from '../types/onboarding'
import { uploadImageToPinata, validateImage } from '../lib/pinata'

interface UsernameSetupScreenProps {
  role: UserRole
  onComplete: (username: string, imageUrl?: string) => void
  onBack: () => void
}

export default function UsernameSetupScreen({
  role,
  onComplete,
  onBack,
}: UsernameSetupScreenProps) {
  const [username, setUsername] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const isUsernameValid = username.length >= 3 && username.length <= 20

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload a profile picture.'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri
        setImageUri(uri)

        // Validate image
        const validation = await validateImage(uri)
        if (!validation.valid) {
          Alert.alert('Invalid Image', validation.error || 'Please choose a different image')
          setImageUri(null)
          return
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image. Please try again.')
    }
  }

  const handleContinue = async () => {
    if (!isUsernameValid) {
      Alert.alert('Invalid Username', 'Username must be 3-20 characters long')
      return
    }

    // Upload image if selected
    if (imageUri && !uploadedImageUrl) {
      setIsUploading(true)
      try {
        const result = await uploadImageToPinata(imageUri)
        setUploadedImageUrl(result.gatewayUrl)
        onComplete(username, result.gatewayUrl)
      } catch (error) {
        console.error('Failed to upload image:', error)
        Alert.alert(
          'Upload Failed',
          'Failed to upload profile picture. Continue without it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => onComplete(username) },
          ]
        )
      } finally {
        setIsUploading(false)
      }
    } else {
      onComplete(username, uploadedImageUrl || undefined)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>
            Choose a username and profile picture (optional)
          </Text>
        </View>

        <View style={styles.content}>
          {/* Profile Picture */}
          <View style={styles.imageContainer}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handlePickImage}
              disabled={isUploading}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>📷</Text>
                  <Text style={styles.placeholderLabel}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {imageUri && (
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handlePickImage}
                disabled={isUploading}
              >
                <Text style={styles.changeButtonText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username (3-20 characters)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              editable={!isUploading}
            />
            <Text style={styles.hint}>
              {username.length}/20 characters
            </Text>
          </View>

          {/* Role Badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              Role: {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={isUploading}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!isUsernameValid || isUploading) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isUsernameValid || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    marginBottom: 4,
  },
  placeholderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  changeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleBadgeText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
