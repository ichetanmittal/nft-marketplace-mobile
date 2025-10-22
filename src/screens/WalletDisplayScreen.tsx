/**
 * Wallet Display Screen (Mobile)
 * Third step - display wallet address
 */

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Image
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { ONBOARDING_TOKENS } from '../types/onboarding'

interface WalletDisplayScreenProps {
  walletAddress: string
  username: string
  onContinue: () => void
  onBack: () => void
}

export default function WalletDisplayScreen({
  walletAddress,
  username,
  onContinue,
  onBack,
}: WalletDisplayScreenProps) {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(walletAddress)
    Alert.alert('Copied!', 'Wallet address copied to clipboard')
  }

  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top bar with subtle Back and username chip */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} accessibilityLabel="Go back">
            <Text style={styles.backLink}>Back</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={styles.userPill}>
            <Text style={styles.userPillText}>@{username}</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Omnichain Wallet</Text>
          <Text style={styles.subtitleMono}>
            Deposit primary tokens into your universal account
          </Text>
        </View>

        {/* Recommended token chips */}
        <View style={styles.chipsRow}>
          {ONBOARDING_TOKENS.map(({ symbol, icon }) => (
            <View key={symbol} style={styles.chip}>
              <View style={styles.chipIcon}>
                <Image source={icon} style={styles.chipIconImage} />
              </View>
              <Text style={styles.chipText}>{symbol}</Text>
            </View>
          ))}
        </View>

        {/* Helper copy */}
        <Text style={styles.helperText}>
          You can deposit any token on supported networks. We recommend any of
          the following 4 tokens, which can be immediately used for gas and
          trading
        </Text>

        {/* Universal Wallet panel */}
        <View style={styles.walletPanel}>
          <Text style={styles.panelTitle}>Your Universal Wallet</Text>

          {/* Solana */}
          <View style={styles.addressRow}>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabelDark}>Solana Address</Text>
              <Text style={styles.addressMono}>{shortAddress}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={copyToClipboard}
            >
              <Text style={styles.iconButtonText}>⧉</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowDivider} />

          {/* EVM */}
          <View style={styles.addressRow}>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabelDark}>EVM Address</Text>
              <Text style={styles.addressMono}>{shortAddress}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={copyToClipboard}
            >
              <Text style={styles.iconButtonText}>⧉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom primary action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>NEXT STEP</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backLink: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'SFProDisplay-Regular',
  },
  userPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userPillText: {
    color: '#111827',
    fontSize: 12,
    fontFamily: 'SFProDisplay-Semibold',
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'SFProDisplay-Heavy',
  },
  subtitleMono: {
    textAlign: 'center',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'SFProDisplay-Medium',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 6,
    marginVertical: 6,
  },
  chipIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  chipIconImage: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  chipIconText: {
    fontSize: 12,
    color: '#111827',
    fontFamily: 'SFProDisplay-Regular',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'SFProDisplay-Semibold',
    color: '#111827',
  },
  helperText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
    fontFamily: 'SFProDisplay-Regular',
  },
  walletPanel: {
    backgroundColor: '#0B0B0B',
    borderRadius: 22,
    padding: 18,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'SFProDisplay-Bold',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowDivider: {
    height: 10,
  },
  addressInfo: {
    flex: 1,
    paddingRight: 10,
  },
  addressLabelDark: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: 'SFProDisplay-Medium',
  },
  addressMono: {
    fontSize: 16,
    color: '#3DFF89',
    fontFamily: 'SFProDisplay-Bold',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1.2,
    fontFamily: 'SFProDisplay-Heavy',
  },
})