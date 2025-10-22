/**
 * Main App Entry Point
 * Privy authentication with user onboarding flow
 */

import 'react-native-get-random-values'
import { Buffer } from 'buffer'
import process from 'process'

global.Buffer = Buffer
global.process = process

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { PrivyProvider, usePrivy, useLoginWithEmail, useEmbeddedEthereumWallet } from '@privy-io/expo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

// Screens
import RoleSelectionScreen from './src/screens/RoleSelectionScreen'
import UsernameSetupScreen from './src/screens/UsernameSetupScreen'
import WalletDisplayScreen from './src/screens/WalletDisplayScreen'
import ProfileScreen from './src/screens/ProfileScreen'

// Types
import type { UserRole, UserProfile } from './src/types/onboarding'
import FundingScreen from '@/screens/FundingScreen'
import ArtSelectionScreen from '@/screens/ArtSelectionScreen'

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
    <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
    </PrivyProvider>
  )
}

function MainApp() {
  const { user, isReady, logout } = usePrivy()
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const { wallets, create: createWallet } = useEmbeddedEthereumWallet()

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

  // Authenticated and onboarded - show main app
  return <MainScreen user={user} onLogout={logout} />
}

// ============================================================================
// Login Screen
// ============================================================================

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)

  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onError: (error) => {
      Alert.alert('Authentication Error', error.message)
    },
    onSendCodeSuccess: () => {
      setShowCodeInput(true)
      Alert.alert('Code Sent', 'Please check your email for the verification code.')
    },
    onLoginSuccess: (user) => {
      console.log('Login successful:', user)
    }
  })

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }

    try {
      await sendCode({ email: email.trim() })
    } catch (error) {
      console.error('Error sending code:', error)
    }
  }

  const handleLogin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code')
      return
    }

    try {
      await loginWithCode({ code: code.trim(), email: email.trim() })
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  const isLoading = state.status === 'sending-code' || state.status === 'submitting-code'

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginContent}>
        <Text style={styles.loginTitle}>Welcome to RWA Marketplace</Text>
        <Text style={styles.loginSubtitle}>
          {showCodeInput ? 'Enter the verification code' : 'Sign in with your email'}
        </Text>

        {!showCodeInput ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Verify & Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setShowCodeInput(false)
                setCode('')
              }}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>Use different email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
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
      <View style={styles.mainContent}>
        {renderContent()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Left Circular Button - Home */}
        <TouchableOpacity
          style={[styles.circularButton, activeTab === 'home' && styles.circularButtonActive]}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIconText, activeTab === 'home' && styles.navIconActive]}>⌂</Text>
        </TouchableOpacity>

        {/* Middle Cylindrical Button - Transactions */}
        <TouchableOpacity
          style={[styles.cylindricalButton, activeTab === 'transactions' && styles.cylindricalButtonActive]}
          onPress={() => setActiveTab('transactions')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIconText, activeTab === 'transactions' && styles.navIconActive]}>$</Text>
          <Text style={[styles.navNumberText, activeTab === 'transactions' && styles.navIconActive]}>199</Text>
        </TouchableOpacity>

        {/* Right Circular Button - Profile */}
        <TouchableOpacity
          style={[styles.circularButton, activeTab === 'profile' && styles.circularButtonActive]}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIconText, activeTab === 'profile' && styles.navIconActive]}>☰</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
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
    <View style={styles.tabContainer}>
      <Text style={styles.mainTitle}>Welcome back!</Text>
      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>Username</Text>
          <Text style={styles.profileValue}>@{profile.username}</Text>

          <Text style={[styles.profileLabel, { marginTop: 16 }]}>Role</Text>
          <Text style={styles.profileValue}>
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </Text>

          <Text style={[styles.profileLabel, { marginTop: 16 }]}>Wallet Address</Text>
          <Text style={styles.profileValue}>
            {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
          </Text>
        </View>
      )}
    </View>
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
    backgroundColor: '#93C5FD',
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
  navNumberText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  navIconActive: {
    color: '#FFFFFF',
  },
})
