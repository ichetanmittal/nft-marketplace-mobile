/**
 * Main App Entry Point
 * Privy authentication with user onboarding flow
 */

import 'react-native-get-random-values'
import { Buffer } from 'buffer'
import process from 'process'
import * as Font from "expo-font";

global.Buffer = Buffer
global.process = process

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, SafeAreaView, StatusBar, Image } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { PrivyProvider, usePrivy, useLoginWithEmail, useEmbeddedEthereumWallet, useLoginWithOAuth, useLoginWithSiwe } from '@privy-io/expo'
import { PrivyElements } from '@privy-io/expo/ui'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Screens
import RoleSelectionScreen from './src/screens/RoleSelectionScreen'
import UsernameSetupScreen from './src/screens/UsernameSetupScreen'
import WalletDisplayScreen from './src/screens/WalletDisplayScreen'
import ProfileScreen from './src/screens/ProfileScreen'

// Types
import type { UserRole, UserProfile } from './src/types/onboarding'
import FundingScreen from '@/screens/FundingScreen'
import ArtSelectionScreen from '@/screens/ArtSelectionScreen'
import HomeScreen from '@/screens/HomeScreen';

const Stack = createNativeStackNavigator()

// Get Privy credentials from environment
const PRIVY_APP_ID = Constants.expoConfig?.extra?.privyAppId || ''
const PRIVY_CLIENT_ID = Constants.expoConfig?.extra?.privyClientId || ''

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  ONBOARDING_COMPLETED: '@onboarding_completed',
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
        <PrivyElements />
        <NavigationContainer>
          <MainApp />
        </NavigationContainer>
      </PrivyProvider>
    </SafeAreaProvider>
  )
}

function MainApp() {
  const { user, isReady, logout } = usePrivy()
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const { wallets, create: createWallet } = useEmbeddedEthereumWallet()
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "SFProDisplay-Regular": require("./assets/fonts/SFProDisplay-Regular.otf"),
        "SFProDisplay-Medium": require("./assets/fonts/SFProDisplay-Medium.otf"),
        "SFProDisplay-Semibold": require("./assets/fonts/SFProDisplay-Semibold.otf"),
        "SFProDisplay-Bold": require("./assets/fonts/SFProDisplay-Bold.otf"),
        "SFProDisplay-Heavy": require("./assets/fonts/SFProDisplay-Heavy.otf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);
  
  // User is authenticated if user object exists
  const authenticated = user !== null

  useEffect(() => {
    checkOnboardingStatus()
  }, [authenticated])

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
      setOnboardingCompleted(completed === 'true')
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  // Not authenticated - show login screen
  if (!authenticated) {
    return <LoginScreen />
  }

  // Authenticated but not onboarded - show onboarding
  if (!onboardingCompleted) {
    return <OnboardingFlow user={user} wallets={wallets} createWallet={createWallet} onComplete={() => setOnboardingCompleted(true)} />
  }

  // Fonts not loaded
  if (!fontsLoaded) return null;

  // Authenticated and onboarded - show main app
  return <MainScreen user={user} onLogout={logout} />
}

// ============================================================================
// Login Screen
// ============================================================================
//
// Authentication Methods:
// 1. Email: OTP sent to email (enabled by default in Privy)
// 2. Google OAuth: Social login via Google
// 3. Twitter/X: Social login via Twitter/X
// 4. Wallet: Sign In With Ethereum (SIWE) - for crypto wallet login
//

type AuthMethod = 'email' | 'google' | 'twitter' | 'wallet'

function LoginScreen() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)

  // Email authentication
  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail({
    onError: (error) => {
      Alert.alert('Email Authentication Error', error.message)
    },
    onSendCodeSuccess: () => {
      setShowCodeInput(true)
      Alert.alert('Code Sent', 'Please check your email for the verification code.')
    },
    onLoginSuccess: (user) => {
      console.log('Email login successful:', user)
    }
  })

  // Google OAuth authentication
  const { login: loginWithGoogle, state: googleState } = useLoginWithOAuth()

  // Twitter/X OAuth authentication (uses same useLoginWithOAuth with provider: 'twitter')
  const twitterOAuthResult = useLoginWithOAuth()

  // Wallet authentication (Sign In With Ethereum)
  const { loginWithSiwe, state: walletState } = useLoginWithSiwe()

  // Email handlers
  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }
    try {
      await sendCode({ email: email.trim() })
    } catch (error: any) {
      console.error('Error sending code:', error)
      Alert.alert('Error', error?.message || 'Failed to send verification code. Please try again.')
    }
  }

  const handleLogin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code')
      return
    }
    try {
      await loginWithCode({ code: code.trim(), email: email.trim() })
    } catch (error: any) {
      console.error('Error logging in:', error)
      Alert.alert('Error', error?.message || 'Failed to verify code. Please try again.')
    }
  }

  // Twitter/X handler
  const handleTwitterLogin = async () => {
    try {
      console.log('Attempting Twitter login with provider: twitter')
      const result = await twitterOAuthResult.login({ provider: 'twitter' })
      console.log('Twitter login successful:', result)
    } catch (error: any) {
      console.error('Error logging in with Twitter:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
      })
      const errorMessage = error?.message || 'Failed to login with Twitter/X. Make sure Twitter OAuth is enabled in Privy dashboard.'
      Alert.alert('Twitter Login Error', errorMessage)
    }
  }

  // Google handler
  const handleGoogleLogin = async () => {
    try {
      console.log('Attempting Google login with provider: google')
      const result = await loginWithGoogle({ provider: 'google' })
      console.log('Google login successful:', result)
    } catch (error: any) {
      console.error('Error logging in with Google:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
      })
      const errorMessage = error?.message || 'Failed to login with Google. Make sure Google OAuth is enabled in Privy dashboard and redirect URIs are configured.'
      Alert.alert('Google Login Error', errorMessage)
    }
  }

  // Wallet handler (Sign In With Ethereum)
  const handleWalletLogin = async () => {
    try {
      // SIWE (Sign In With Ethereum) flow:
      // 1. Get the user's wallet address
      // 2. Generate SIWE message with their wallet
      // 3. Sign the message with their wallet
      // 4. Call loginWithSiwe with signature and message
      Alert.alert('Wallet Login', 'Wallet integration requires signing with your crypto wallet. Coming soon!')
    } catch (error) {
      console.error('Error logging in with wallet:', error)
      Alert.alert('Error', 'Failed to initiate wallet login.')
    }
  }

  const isEmailLoading = emailState.status === 'sending-code' || emailState.status === 'submitting-code'
  const isGoogleLoading = googleState.status === 'loading'
  const isTwitterLoading = twitterOAuthResult.state.status === 'loading'
  const isWalletLoading = walletState.status === 'generating-message' || walletState.status === 'awaiting-signature'
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [password, setPassword] = useState('')

  return (
    <LinearGradient
      colors={['#C8FF00', '#E8FFA6', '#F5FFD9', '#FFFFFF']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.loginGradientContainer}
    >
      <SafeAreaView style={styles.loginSafeArea}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.loginContent}>
          {/* Signup/Login Header */}
          <LinearGradient
            colors={['#F0F0F0', '#000000']}
            start={{ x: 4, y: 0 }}
            end={{ x: 0, y: 4 }}
            style={styles.loginHeaderContainer}
          >
            <Text style={styles.loginHeaderText}>SIGNUP/LOGIN</Text>
          </LinearGradient>

          {/* Email Input */}
          {!showCodeInput ? (
            <>
              <TextInput
                style={styles.loginInput}
                placeholder="E-MAIL"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isEmailLoading}
              />

              {/* Password Input */}
              {/* <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.loginPasswordInput}
                  placeholder="PASSWORD"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  editable={!isEmailLoading}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.passwordToggleIcon}>
                    {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View> */}

              {/* Send Code Button */}
              <TouchableOpacity
                style={[styles.sendCodeButton, isEmailLoading && styles.loginButtonDisabled]}
                onPress={handleSendCode}
                disabled={isEmailLoading}
                activeOpacity={0.7}
              >
                {isEmailLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendCodeButtonText}>SEND CODE</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Code Input Screen */}
              <TextInput
                style={styles.loginInput}
                placeholder="VERIFICATION CODE"
                placeholderTextColor="#999999"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                editable={!isEmailLoading}
              />

              <TouchableOpacity
                style={[styles.sendCodeButton, isEmailLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isEmailLoading}
                activeOpacity={0.7}
              >
                {isEmailLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendCodeButtonText}>VERIFY & SIGN IN</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setShowCodeInput(false)
                  setCode('')
                }}
                disabled={isEmailLoading}
                activeOpacity={0.5}
              >
                <Text style={styles.backButtonText}>Use different email</Text>
              </TouchableOpacity>
            </>
          )}

          {/* OR Divider */}
          <View style={styles.orDividerContainer}>
            <View style={styles.orDividerLine} />
            <Text style={styles.orDividerText}>OR</Text>
            <View style={styles.orDividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleTwitterLogin}
              disabled={isTwitterLoading}
              activeOpacity={0.6}
            >
              {isTwitterLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Image 
                  source={require('./assets/twitter.png')} 
                  style={styles.socialButtonImage}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={isGoogleLoading}
              activeOpacity={0.6}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Image 
                  source={require('./assets/google.png')} 
                  style={styles.socialButtonImage}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================================================
// Onboarding Flow
// ============================================================================

interface OnboardingFlowProps {
  user: any
  wallets: any[]
  createWallet: () => Promise<any>
  onComplete: () => void
}

function OnboardingFlow({ user, wallets, createWallet, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<'role' | 'username' | 'wallet' | 'funding' | 'art'>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [username, setUsername] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>()
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)

  // Get wallet address - create wallet if needed
  useEffect(() => {
    const createWalletIfNeeded = async () => {
      if (currentStep === 'wallet' && wallets.length === 0 && !isCreatingWallet) {
        setIsCreatingWallet(true)
        try {
          await createWallet()
        } catch (error) {
          console.error('Error creating wallet:', error)
        } finally {
          setIsCreatingWallet(false)
        }
      }
    }
    createWalletIfNeeded()
  }, [currentStep, wallets.length, isCreatingWallet])

  // Get wallet address from embedded wallet or linked accounts
  const walletAddress = wallets[0]?.address || user?.linked_accounts?.find((acc: any) => acc.type === 'wallet')?.address || ''

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setCurrentStep('username')
  }

  const handleUsernameComplete = (newUsername: string, imageUrl?: string) => {
    setUsername(newUsername)
    setProfileImageUrl(imageUrl)
    setCurrentStep('wallet')
  }
  
  const handleWalletComplete = () => {
    setCurrentStep('funding')
  }

  const handleOnboardingComplete = async () => {
    try {
      // Save user profile
      const profile: UserProfile = {
        role: selectedRole!,
        username,
        walletAddress: walletAddress || '',
        profileImageUrl,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true')

      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  if (currentStep === 'role') {
    return <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
  }

  if (currentStep === 'username' && selectedRole) {
    return (
      <UsernameSetupScreen
        role={selectedRole}
        onComplete={handleUsernameComplete}
        onBack={() => setCurrentStep('role')}
      />
    )
  }

  if (currentStep === 'wallet') {
    // Wait for wallet to be created
    if (wallets.length === 0 || !walletAddress) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Setting up your wallet...</Text>
        </View>
      )
    }

    return (
      <WalletDisplayScreen
        walletAddress={walletAddress}
        username={username}
        onContinue={handleWalletComplete}
        onBack={() => setCurrentStep('username')}
      />
    )
  }

  if (currentStep === "funding" && username) {
    if(username) {
        return (
          <FundingScreen
            username={username}
            onTopUp={() => setCurrentStep("art")}
            onSkip={() => setCurrentStep("art")}
          />
        );
    }
  }

  if (currentStep === "art") {
    return (
      <ArtSelectionScreen
        onComplete={handleOnboardingComplete}
        onBack={() => setCurrentStep("funding")}
      />
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Setting up your profile...</Text>
    </View>
  )
}

// ============================================================================
// Main Screen (After Onboarding)
// ============================================================================

interface MainScreenProps {
  user: any
  onLogout: () => void
}

function MainScreen({ user, onLogout }: MainScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'transactions'>('home')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE)
      if (profileData) {
        setProfile(JSON.parse(profileData))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE)
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
      await onLogout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab profile={profile} onLogout={handleLogout} />
      case 'profile':
        return <ProfileTab profile={profile} onLogout={handleLogout} onBack={() => setActiveTab('home')}/>
      case 'transactions':
        return <TransactionsTab />
      default:
        return null
    }
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.mainContent}>{renderContent()}</View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Left Circular Button - Home */}
        <TouchableOpacity
          style={[
            styles.circularButton,
            activeTab === "home" && styles.circularButtonActive,
          ]}
          onPress={() => setActiveTab("home")}
          activeOpacity={0.8}
        >
          <Image
            source={require("./assets/home.png")}
            style={[styles.navIconImage]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Middle Cylindrical Button - Transactions */}
        <TouchableOpacity
          style={[
            styles.cylindricalButton,
            activeTab === "transactions" && styles.cylindricalButtonActive,
          ]}
          onPress={() => setActiveTab("transactions")}
          activeOpacity={0.8}
        >
          <Image
            source={require("./assets/wallet.png")}
            style={[
              styles.navIconImage,
              activeTab === "transactions" && styles.navIconActive,
            ]}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.navNumberText,
              activeTab === "transactions" && styles.navIconActive,
            ]}
          >
            199.99
          </Text>
        </TouchableOpacity>

        {/* Right Circular Button - Profile */}
        <TouchableOpacity
          style={[
            styles.circularButton,
            activeTab === "profile" && styles.circularButtonActive,
          ]}
          onPress={() => setActiveTab("profile")}
          activeOpacity={0.8}
        >
          <Image
            source={require("./assets/profile.png")}
            style={[styles.navIconImage]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// Tab Components
// ============================================================================

interface TabProps {
  profile: UserProfile | null
  onLogout?: () => void
  onBack?: () => void
}

function HomeTab({ profile }: TabProps) {
  return (
    <HomeScreen />
  )
}

function ProfileTab({ profile, onLogout, onBack }: TabProps) {
  return (
    <ProfileScreen
      profile={profile}
      onLogout={onLogout}
      onBack={onBack}
    />
  );
}

function TransactionsTab() {
  return (
    <View style={styles.tabContainer}>
      <Text style={styles.mainTitle}>Transactions</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No transactions yet</Text>
      </View>
    </View>
  )
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  loginContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#1A1A1A',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  profileLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Tab styles
  tabContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  // Bottom Navigation styles
  bottomNav: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Circular buttons (left and right)
  circularButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  circularButtonActive: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Cylindrical button (middle)
  cylindricalButton: {
    paddingHorizontal: 18,
    height: 64,
    paddingVertical: 12,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
    minWidth: 120,
    maxWidth: 200,
    flexDirection: 'row',
    gap: 8,
  },
  cylindricalButtonActive: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  navIconText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  navIconImage: {
    width: 28,
    height: 28,
  },
  navNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  navIconActive: {
    color: "#FFFFFF",
    tintColor: '#FFFFFF',
  },
  // Auth method tabs styles
  authMethodTabs: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  authMethodTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  authMethodTabActive: {
    borderBottomColor: '#3B82F6',
  },
  authMethodTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  authMethodTabTextActive: {
    color: '#3B82F6',
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  // Google button styles
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  googleButtonIcon: {
    fontSize: 24,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  // Twitter/X button styles
  twitterButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  twitterButtonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  twitterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Wallet button styles
  walletButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  walletButtonIcon: {
    fontSize: 24,
  },
  walletButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // New Login Screen Styles
  loginGradientContainer: {
    flex: 1,
  },
  loginSafeArea: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  loginHeaderContainer: {
    marginBottom: 32,
    width: "87%",
    borderColor: '#F5F5F5',
    borderWidth: 2,
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  loginHeaderText: {
    fontSize: 13,
    fontFamily: 'SFProDisplay-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonInactive: {
    backgroundColor: '#FFFFFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: 'SFProDisplay-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  toggleButtonTextInactive: {
    color: '#000000',
  },
  loginInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 13,
    fontFamily: 'SFProDisplay-Regular',
    color: '#000000',
    marginBottom: 12,
    width: '87%',
    height: 56,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 32,
    width: '100%',
  },
  loginPasswordInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingRight: 60,
    fontSize: 13,
    fontFamily: 'SFProDisplay-Regular',
    color: '#000000',
    width: '100%',
    height: 56,
  },
  passwordToggle: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggleIcon: {
    fontSize: 20,
  },
  sendCodeButton: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    width: '87%',
    height: 56,
  },
  sendCodeButtonText: {
    fontSize: 13,
    fontFamily: 'SFProDisplay-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orDividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontFamily: 'SFProDisplay-Regular',
    color: '#999999',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonIcon: {
    fontSize: 22,
    fontFamily: 'SFProDisplay-Bold',
    color: '#000000',
  },
  socialButtonImage: {
    width: 24,
    height: 24,
  },
})
