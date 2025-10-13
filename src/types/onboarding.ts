/**
 * Onboarding & User Profile Types
 * Mobile version types for React Native
 */

export type UserRole = 'artist' | 'collector' | 'curator'

export type OnboardingStep =
  | 'role-selection'
  | 'username-setup'
  | 'wallet-display'
  | 'funding'

export interface UserProfile {
  role: UserRole
  username: string
  walletAddress: string
  profileImageUrl?: string
  onboardingCompleted: boolean
  createdAt: string
}

export interface RoleOption {
  id: UserRole
  title: string
  description: string
  icon: string
  color: string
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'artist',
    title: 'Artist',
    description: 'Create and sell your NFT artwork',
    icon: '🎨',
    color: '#8B5CF6'
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Discover and collect unique NFTs',
    icon: '💎',
    color: '#3B82F6'
  },
  {
    id: 'curator',
    title: 'Curator',
    description: 'Curate and showcase NFT collections',
    icon: '⭐',
    color: '#F59E0B'
  }
]
