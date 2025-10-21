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

// ------------------------------
// Onboarding: Recommended tokens
// ------------------------------
export type ChainId = 'ethereum' | 'solana' | 'bsc' | 'multi'

export interface OnboardingTokenMeta {
  /** Common market symbol / ticker */
  symbol: 'ETH' | 'SOL' | 'BNB' | 'USDT' | 'USDC'
  /** Human-readable name */
  name: string
  /** Primary chain association for iconography */
  chain: ChainId
  /** Simple glyph to show as an inline symbol in RN UI */
  icon: string
}

export const ONBOARDING_TOKENS: OnboardingTokenMeta[] = [
  { symbol: 'ETH', name: 'Ethereum', chain: 'ethereum', icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', chain: 'solana', icon: '◎' },
  { symbol: 'BNB', name: 'BNB', chain: 'bsc', icon: '◇' },
  { symbol: 'USDT', name: 'Tether', chain: 'multi', icon: '₮' },
  { symbol: 'USDC', name: 'USD Coin', chain: 'multi', icon: 'Ⓢ' },
]
