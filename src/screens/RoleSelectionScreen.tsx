/**
 * Role Selection Screen (Mobile)
 * First step of onboarding - choose Artist, Collector, or Curator
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { UserRole, RoleOption } from '../types/onboarding'
import { ROLE_OPTIONS } from '../types/onboarding'

const STORAGE_KEYS = {
  selectedRole: 'onboarding:selected-role',
}

interface RoleSelectionScreenProps {
  onRoleSelect: (role: UserRole) => void
}

export default function RoleSelectionScreen({ onRoleSelect }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  // Restore previously selected role if available
  useEffect(() => {
    ;(async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.selectedRole)
        if (saved) setSelectedRole(saved as UserRole)
      } catch {
        // ignore restore errors
      }
    })()
  }, [])

  const handleCardSelect = useCallback((role: UserRole) => {
    setSelectedRole(role)
  }, [])

  const handleNext = useCallback(async () => {
    if (!selectedRole) return
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.selectedRole, selectedRole)
    } catch {
      // swallowing storage error, still proceed
    }
    onRoleSelect(selectedRole)
  }, [onRoleSelect, selectedRole])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{'Choose\nYour Role'}</Text>
          </View>
        </View>

        <View style={styles.rolesContainer}>
          {ROLE_OPTIONS.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              selected={selectedRole === role.id}
              onPress={() => handleCardSelect(role.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedRole && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={!selectedRole}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedRole }}
        >
          <Text style={[styles.nextButtonText, !selectedRole && styles.nextButtonTextDisabled]}>Next Step</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

interface RoleCardProps {
  role: RoleOption
  onPress: () => void
  selected?: boolean
}

function RoleCard({ role, onPress, selected }: RoleCardProps) {
  const isCurator = role.id === 'curator'

  return (
    <TouchableOpacity
      style={[
        styles.roleCard,
        isCurator ? styles.roleCardFull : styles.roleCardHalf,
        styles.roleCardLight,
        selected && styles.roleCardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.roleHeader}>
        <Image
          source={role.icon}
          style={styles.roleIcon}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.roleTitle,
            selected ? styles.roleTitleDark : styles.roleTitleLight,
          ]}
        >
          {role.title.toUpperCase()}
        </Text>
      </View>
      <Text
        style={[
          styles.roleDescription,
          selected ? styles.roleDescriptionDark : styles.roleDescriptionLight,
        ]}
      >
        {role.description.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
  },
  header: {
    marginBottom: 28,
    alignItems: "center",
  },
  titleWrap: {
    position: "relative",
  },
  title: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: "SFProDisplay-Heavy",
    color: "#0B0B0B",
    textAlign: "center",
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  roleCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  roleCardHalf: {
    width: "48%",
    minHeight: 150,
  },
  roleCardFull: {
    width: "100%",
    minHeight: 150,
  },
  roleCardLight: {
    backgroundColor: "#F2F3F5",
  },
  roleCardSelected: {
    backgroundColor: "#0A0A0A",
  },
  roleHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 10,
  },
  roleIcon: {
    width: 32,
    height: 32,
  },
  roleTitle: {
    fontSize: 20,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "SFProDisplay-Heavy",
  },
  roleTitleLight: {
    color: "#0B0B0B",
  },
  roleTitleDark: {
    color: "#FFFFFF",
  },
  roleDescription: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "SFProDisplay-Medium",
  },
  roleDescriptionLight: {
    color: "#81858D",
  },
  roleDescriptionDark: {
    color: "#BDBDBD",
  },
  footer: {
    paddingHorizontal: 24,
    marginTop: 28,
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "SFProDisplay-Heavy",
  },
  nextButtonTextDisabled: {
    color: "#F9FAFB",
    opacity: 0.8,
  },
});