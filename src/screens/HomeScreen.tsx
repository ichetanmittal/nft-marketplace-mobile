import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Sample NFT data
const nftData = [
  {
    id: "1",
    image: "https://via.placeholder.com/400x400/808080/FFFFFF?text=NFT+1",
    creator: "CMITICOSINSKY",
    price: "0.24",
    originalPrice: "0.42",
    percentageUp: "+50%",
    likes: "999+",
    comments: "999+",
    hasBuyers: false,
  },
  {
    id: "2",
    image: "https://via.placeholder.com/400x400/4A90E2/FFFFFF?text=NFT+2",
    creator: "DIGITALARTIST",
    price: "0.18",
    originalPrice: "0.30",
    percentageUp: "+35%",
    likes: "850+",
    comments: "420+",
    hasBuyers: false,
  },
  {
    id: "3",
    image: "https://via.placeholder.com/400x400/E94B3C/FFFFFF?text=NFT+3",
    creator: "CRYPTOKING",
    price: "0.32",
    originalPrice: "0.50",
    percentageUp: "+42%",
    likes: "1.2K+",
    comments: "680+",
    hasBuyers: true,
  },
];

// Sample curator data
const curatorPicks = [
  {
    id: "1",
    name: "ISMA",
    count: "+4",
    image: "https://via.placeholder.com/100/000000/FFFFFF?text=ISMA",
  },
  {
    id: "2",
    name: "AMIRB2B",
    count: "+2",
    image: "https://via.placeholder.com/100/D3D3D3/000000?text=AMIRB2B",
  },
  {
    id: "3",
    name: "SMALL TALK",
    count: "+2",
    image: "https://via.placeholder.com/100/4A90E2/FFFFFF?text=SMALL+TALK",
  },
  {
    id: "4",
    name: "SPICE",
    count: "+3",
    image: "https://via.placeholder.com/100/F5F5F5/000000?text=SPICE",
  },
];

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / (SCREEN_HEIGHT - 200));
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Feed Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>⚽</Text>
          </View>
          <Text style={styles.logoText}>Feed</Text>
        </View>

        {/* Open Calls Section */}
        <View style={styles.openCallsWrapper}>
          <LinearGradient
            colors={["#C8FF00", "#E8FFA6", "#F5FFD9"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            locations={[0, 0.5, 1]}
            style={styles.openCallsContainer}
          >
            <View style={styles.openCallsLeft}>
              <View style={styles.avatarStack}>
                <Image
                  source={{
                    uri: "https://via.placeholder.com/40/FF6B6B/FFFFFF?text=A",
                  }}
                  style={[styles.avatar, { zIndex: 3 }]}
                />
                <Image
                  source={{
                    uri: "https://via.placeholder.com/40/4ECDC4/FFFFFF?text=B",
                  }}
                  style={[styles.avatar, { zIndex: 2, marginLeft: -12 }]}
                />
                <Image
                  source={{
                    uri: "https://via.placeholder.com/40/95E1D3/000000?text=C",
                  }}
                  style={[styles.avatar, { zIndex: 1, marginLeft: -12 }]}
                />
              </View>
              <View style={styles.openCallsTextContainer}>
                <Text style={styles.openCallsTitle}>OPEN CALLS</Text>
                <Text style={styles.openCallsTime}>24 DAYS 1 HOUR</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>SEE ALL</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Curator's & Collector's Picks */}
        <View style={styles.picksSection}>
          <Text style={styles.picksSectionTitle}>
            Curator's & Collector's Picks
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.picksScrollContainer}
          >
            {curatorPicks.map((pick, index) => (
              <View
                key={pick.id}
                style={[
                  styles.pickItem,
                  index === 1 && styles.pickItemHighlighted,
                ]}
              >
                <View style={styles.pickImageContainer}>
                  <Image
                    source={{ uri: pick.image }}
                    style={styles.pickImage}
                  />
                  <View style={styles.pickBadge}>
                    <Text style={styles.pickBadgeText}>{pick.count}</Text>
                  </View>
                </View>
                <Text style={styles.pickName}>{pick.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* NFT Cards Scroll View */}
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.nftScrollView}
      >
        {nftData.map((nft) => (
          <View key={nft.id} style={styles.nftCard}>
            {/* NFT Image */}
            <View style={styles.nftImageContainer}>
              <Image
                source={{ uri: nft.image }}
                style={styles.nftImage}
                resizeMode="cover"
              />

              {/* Percentage Badge */}
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageIcon}>↗</Text>
                <Text style={styles.percentageText}>{nft.percentageUp}</Text>
              </View>

              {/* Creator Badge */}
              <View style={styles.creatorBadge}>
                <Image
                  source={{
                    uri: "https://via.placeholder.com/32/666666/FFFFFF?text=C",
                  }}
                  style={styles.creatorAvatar}
                />
                <Text style={styles.creatorText}>BY {nft.creator}</Text>
                <Text style={styles.starIcon}>⭐</Text>
              </View>
            </View>

            {/* NFT Details */}
            <View style={styles.nftDetails}>
              {/* Price Section */}
              <View style={styles.priceSection}>
                <View style={styles.priceLeft}>
                  <Text style={styles.priceIcon}>↗</Text>
                  <Text style={styles.priceText}>{nft.price} ETH</Text>
                  <Text style={styles.originalPrice}>
                    {nft.originalPrice} ETH
                  </Text>
                </View>
                <View style={styles.ethereumBadge}>
                  <Text style={styles.ethereumIcon}>◆</Text>
                </View>
              </View>

              {/* Actions Section */}
              <View style={styles.actionsSection}>
                <View style={styles.actionsLeft}>
                  {/* Likes */}
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>♡</Text>
                    <Text style={styles.actionText}>{nft.likes}</Text>
                  </TouchableOpacity>

                  {/* Comments */}
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>{nft.comments}</Text>
                  </TouchableOpacity>
                </View>

                {/* Boost Button */}
                <TouchableOpacity style={styles.boostButton}>
                  <Text style={styles.boostIcon}>🚀</Text>
                  <Text style={styles.boostText}>BOOST</Text>
                </TouchableOpacity>
              </View>

              {/* Buyers Status */}
              <View style={styles.buyersStatus}>
                <Text style={styles.buyersStatusText}>
                  {nft.hasBuyers ? "HAS BUYERS" : "NO BUYERS YET"}
                </Text>
              </View>

              {/* Buy Now Button */}
              <TouchableOpacity style={styles.buyNowButton}>
                <Text style={styles.buyNowPrice}>≈1126.3 $</Text>
                <View style={styles.buyNowDivider} />
                <Text style={styles.buyNowText}>BUY NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#C8FF00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoEmoji: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 32,
    fontFamily: "SFProDisplay-Bold",
    color: "#000000",
  },
  openCallsWrapper: {
    marginHorizontal: 20,
    marginVertical: 15,
  },
  openCallsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 20,
  },
  openCallsLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarStack: {
    flexDirection: "row",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  openCallsTextContainer: {
    flex: 1,
  },
  openCallsTitle: {
    fontSize: 14,
    fontFamily: "SFProDisplay-Bold",
    color: "#000000",
    letterSpacing: 0.5,
  },
  openCallsTime: {
    fontSize: 11,
    fontFamily: "SFProDisplay-Regular",
    color: "#666666",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  seeAllButton: {
    backgroundColor: "#C8FF00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: "SFProDisplay-Bold",
    color: "#000000",
    letterSpacing: 0.5,
  },
  picksSection: {
    paddingVertical: 15,
  },
  picksSectionTitle: {
    fontSize: 18,
    fontFamily: "SFProDisplay-Bold",
    color: "#000000",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  picksScrollContainer: {
    paddingHorizontal: 20,
  },
  pickItem: {
    alignItems: "center",
    marginRight: 20,
  },
  pickItemHighlighted: {
    transform: [{ scale: 1.05 }],
  },
  pickImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  pickImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#E8FFA6",
  },
  pickBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  pickBadgeText: {
    fontSize: 11,
    fontFamily: "SFProDisplay-Bold",
    color: "#000000",
  },
  pickName: {
    fontSize: 11,
    fontFamily: "SFProDisplay-Semibold",
    color: "#666666",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  nftScrollView: {
    flex: 1,
  },
  nftCard: {
    height: SCREEN_HEIGHT - 200,
    padding: 20,
  },
  nftImageContainer: {
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  nftImage: {
    width: "100%",
    height: "100%",
  },
  percentageBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  percentageIcon: {
    fontSize: 14,
    color: "#00C853",
    marginRight: 4,
  },
  percentageText: {
    fontSize: 14,
    fontFamily: "SFProDisplay-Bold",
    color: "#00C853",
  },
  creatorBadge: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  creatorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "SFProDisplay-Bold",
    color: "#000000",
    letterSpacing: 0.5,
  },
  starIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  nftDetails: {
    paddingTop: 15,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  priceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceIcon: {
    fontSize: 18,
    color: "#00C853",
    marginRight: 8,
  },
  priceText: {
    fontSize: 24,
    fontFamily: "SFProDisplay-Bold",
    color: "#00C853",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    fontFamily: "SFProDisplay-Medium",
    color: "#999999",
    textDecorationLine: "line-through",
  },
  ethereumBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  ethereumIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "SFProDisplay-Semibold",
    color: "#000000",
  },
  boostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C8FF00",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  boostIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  boostText: {
    fontSize: 14,
    fontFamily: "SFProDisplay-Bold",
    color: "#000000",
    letterSpacing: 0.5,
  },
  buyersStatus: {
    alignItems: "center",
    paddingVertical: 10,
  },
  buyersStatusText: {
    fontSize: 12,
    fontFamily: "SFProDisplay-Semibold",
    color: "#999999",
    letterSpacing: 1,
  },
  buyNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 5,
  },
  buyNowPrice: {
    fontSize: 14,
    fontFamily: "SFProDisplay-Semibold",
    color: "#FFFFFF",
  },
  buyNowDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#666666",
    marginHorizontal: 15,
  },
  buyNowText: {
    fontSize: 14,
    fontFamily: "SFProDisplay-Medium",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
