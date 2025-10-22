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
        </View>

        <View style={styles.content}>
          {/* Profile Picture with Icon Overlay */}
          <View style={styles.imageContainer}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handlePickImage}
              disabled={isUploading}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage} />
              )}
            </TouchableOpacity>

            {/* Icon overlay button - placeholder for PNG icon */}
            <TouchableOpacity
              style={styles.iconOverlay}
              onPress={handlePickImage}
              disabled={isUploading}
            >
              <Image
                source={require("../../assets/group.png")}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="NEWNICKNAME_02"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              editable={!isUploading}
            />
          </View>

          {/* Availability Checking */}
          {username.length > 0 && (
            <Text style={styles.availabilityText}>AVAILABILITY CHECKING</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!isUsernameValid || isUploading) && styles.createButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isUsernameValid || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 44,
    lineHeight: 50,
    color: "#000000",
    textAlign: "center",
    fontFamily: "SFProDisplay-Heavy",
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 80,
  },
  imagePicker: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  iconOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  iconPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "SFProDisplay-Regular",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    fontFamily: "SFProDisplay-Medium",
    letterSpacing: 0.5,
  },
  availabilityText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: "SFProDisplay-Regular",
    letterSpacing: 1.5,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
  },
  createButton: {
    backgroundColor: "#000000",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    letterSpacing: 1.5,
    fontFamily: "SFProDisplay-Heavy",
  },
});