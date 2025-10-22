import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserProfile } from "@/types/onboarding";

interface ProfileScreenProps {
  profile: UserProfile | null;
  onLogout?: () => void;
  onBack?: () => void;
}

export default function ProfileScreen({
  profile,
  onLogout,
  onBack
}: ProfileScreenProps) {
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No profile data</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonCircle} onPress={onBack}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creator Profile</Text>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#F5F5F5"
          }}
        />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar and User Info Row */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            {profile.profileImageUrl ? (
              <Image
                source={{ uri: profile.profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>👤</Text>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.username}</Text>
              <Text style={styles.starIcon}>⭐</Text>
            </View>
            <Text style={styles.performanceTag}>VERY GOOD PERFORMANCE</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>120</Text>
            <Text style={styles.statLabel}>WORKS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,521</Text>
            <Text style={styles.statLabel}>FOLLOWERS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>EXHIBITIONS</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bioTitle}>HI THERE!</Text>
          <Text style={styles.bioText}>
            My name is {profile.username} and I'm a doctor of AI-science. Glad
            to see you in my profile!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.followButton}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.35)",
                "rgba(255,255,255,0.15)",
                "rgba(255,255,255,0)",
              ]}
              locations={[0, 0.55, 1]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0.4, y: 0.6 }}
              style={styles.followGradTR}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.28)",
                "rgba(255,255,255,0.12)",
                "rgba(255,255,255,0)",
              ]}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0.6, y: 0.4 }}
              style={styles.followGradBL}
              pointerEvents="none"
            />
            <Text style={styles.followButtonText}>FOLLOW ME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>•••</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Open Edition Card */}
      <View style={styles.editionCard}>
        <View style={styles.editionLeft}>
          <View style={styles.editionAvatar}>
            <Text style={styles.editionAvatarText}>👤</Text>
          </View>
          <View style={styles.editionInfo}>
            <Text style={styles.editionTitle}>OPEN EDITION</Text>
            <Text style={styles.editionTime}>14 DAYS 2 HOUR</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.applyButton}>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.45)",
              "rgba(255,255,255,0.2)",
              "rgba(255,255,255,0)",
            ]}
            locations={[0, 0.6, 1]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.35, y: 0.65 }}
            style={styles.applyGradTR}
            pointerEvents="none"
          />
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.22)",
              "rgba(255,255,255,0.1)",
              "rgba(255,255,255,0)",
            ]}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0.6, y: 0.4 }}
            style={styles.applyGradBL}
            pointerEvents="none"
          />
          <Text style={styles.applyButtonText}>APPLY</Text>
        </TouchableOpacity>
      </View>

      {/* Performance Prediction */}
      <View style={styles.performanceSection}>
        <Text style={styles.performanceTitle}>Performance Prediction</Text>
        <Text style={styles.performanceSubtitle}>BY 120 WORKS</Text>

        <View style={styles.performanceCard}>
          <View style={styles.performanceIcons}>
            <Text style={styles.iconText}>Random things here</Text>
          </View>
          <Text style={styles.performanceRating}>** GOOD</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>DETAILS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button (if onLogout is provided) */}
      {onLogout && (
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#999",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#F5F5F5",
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    bottom: 4,
    fontSize: 32,
    color: "#000",
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    marginRight: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D0D0D0",
  },
  avatarPlaceholderText: {
    fontSize: 40,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#000",
    marginRight: 8,
  },
  starIcon: {
    fontSize: 22,
  },
  performanceTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF1493",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
    letterSpacing: 0.5,
  },
  bioSection: {
    marginBottom: 20,
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  bioText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  followButton: {
    flex: 1,
    backgroundColor: "#B7FF3C",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
    zIndex: 1,
  },
  // Gradients for Follow button
  followGradTR: {
    position: "absolute",
    top: -24,
    right: -24,
    width: "200%",
    height: "200%",
    borderRadius: 66,
  },
  followGradBL: {
    position: "absolute",
    bottom: -24,
    left: -24,
    width: "200%",
    height: "200%",
    borderRadius: 999,
  },
  moreButton: {
    width: 56,
    backgroundColor: "#E8E8E8",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  editionCard: {
    backgroundColor: "#FFFFFF", // outer white card
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 8, // subtle inner gutter
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    // soft shadow like the mock
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
    gap: 12,
  },
  editionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#CFFF93", // softer light green like the mock
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  editionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  editionAvatarText: {
    fontSize: 24,
  },
  editionInfo: {
    flex: 1,
  },
  editionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  editionTime: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 0.5,
  },
  applyButton: {
    backgroundColor: "#B7FF3C",
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 0,
    position: "relative",
    overflow: "hidden",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
    zIndex: 2,
  },
  // Gradients for Apply button
  applyGradTR: {
    position: "absolute",
    top: -24,
    right: -24,
    width: "180%",
    height: "180%",
    borderRadius: 999,
  },
  applyGradBL: {
    position: "absolute",
    bottom: -24,
    left: -24,
    width: "150%",
    height: "150%",
    borderRadius: 999,
  },
  performanceSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 4,
  },
  performanceSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  performanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  performanceIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 20,
  },
  iconDivider: {
    width: 24,
    height: 2,
    backgroundColor: "#FF1493",
  },
  performancePrice: {
    alignItems: "center",
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginRight: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  performanceRating: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF1493",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderTopWidth: 2,
    borderTopColor: "#000",
    width: "100%",
    alignItems: "center",
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
