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
  icon: any
  color: string
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'artist',
    title: 'Artist',
    description: 'Create and sell your NFT artwork',
    icon: require('../../assets/Creator.png'),
    color: '#8B5CF6'
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Discover and collect unique NFTs',
    icon: require('../../assets/Collector.png'),
    color: '#3B82F6'
  },
  {
    id: 'curator',
    title: 'Curator',
    description: 'Curate and showcase NFT collections',
    icon: require('../../assets/Curator.png'),
    color: '#F59E0B'
  }
]

// ------------------------------
// Onboarding: Recommended tokens
// ------------------------------
export type ChainId = 'ethereum' | 'solana' | 'bsc' | 'multi'

export interface OnboardingTokenMeta {
  /** Common market symbol / ticker */
  symbol: "POL" | "SOL" | "BNB" | "BASE";
  /** Human-readable name */
  name: string;
  /** Primary chain association for iconography */
  chain: ChainId;
  /** Simple glyph to show as an inline symbol in RN UI */
  icon: any;
}

export const ONBOARDING_TOKENS: OnboardingTokenMeta[] = [
  { symbol: "POL", name: "Polygon", chain: "ethereum", icon: require("../../assets/polygon.png") },
  { symbol: "SOL", name: "Solana", chain: "solana", icon: require("../../assets/solana.png") },
  { symbol: "BNB", name: "BNB", chain: "bsc", icon: require("../../assets/bnb.png") },
  { symbol: "BASE", name: "Base", chain: "multi", icon: require("../../assets/base.png") },
];