/**
 * Role Selection Screen (Mobile)
 * First step of onboarding - choose Artist, Collector, or Curator
 */

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import type { UserRole, RoleOption } from '../types/onboarding'
import { ROLE_OPTIONS } from '../types/onboarding'

interface RoleSelectionScreenProps {
  onRoleSelect: (role: UserRole) => void
}

export default function RoleSelectionScreen({ onRoleSelect }: RoleSelectionScreenProps) {
  const handleRoleSelect = (role: UserRole) => {
    onRoleSelect(role)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to RWA Marketplace</Text>
          <Text style={styles.subtitle}>Choose your role to get started</Text>
        </View>

        <View style={styles.rolesContainer}>
          {ROLE_OPTIONS.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onPress={() => handleRoleSelect(role.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

interface RoleCardProps {
  role: RoleOption
  onPress: () => void
}

function RoleCard({ role, onPress }: RoleCardProps) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, { borderColor: role.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.roleHeader}>
        <Text style={styles.roleIcon}>{role.icon}</Text>
        <Text style={[styles.roleTitle, { color: role.color }]}>{role.title}</Text>
      </View>
      <Text style={styles.roleDescription}>{role.description}</Text>
    </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  roleIcon: {
    fontSize: 32,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
})
