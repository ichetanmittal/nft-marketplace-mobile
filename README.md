# RWA Marketplace - Mobile App (React Native + Expo)

Complete React Native mobile version of the RWA omnichain NFT marketplace with Privy embedded wallets and Biconomy MEE.

## Features

All features from the web app, optimized for mobile:

- **Complete Onboarding Flow**
  - Role selection (Artist/Collector/Curator)
  - Username & profile picture upload (IPFS via Pinata)
  - Multi-chain wallet display
  - Optional funding step

- **Omnichain NFT Marketplace**
  - Gasless NFT listing
  - Cross-chain NFT purchases with auto-bridging
  - Batch buying across multiple chains
  - Single signature for complex flows

- **Mobile-Optimized UI**
  - Native iOS & Android support
  - Touch-friendly interfaces
  - Image picker integration
  - Async storage for persistence

- **Full Web3 Stack**
  - Privy Expo SDK for authentication
  - Biconomy AbstractJS for account abstraction
  - EIP-7702 smart accounts
  - Support for 5 chains (Base, Optimism, Polygon, Arbitrum, Ethereum)

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Privy App ID
- Biconomy MEE API Key
- Pinata JWT (for profile images)

## Setup

### 1. Install Dependencies

```bash
cd market-mobile
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
# Privy Configuration
EXPO_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# Biconomy MEE API Key
EXPO_PUBLIC_BICONOMY_MEE_API_KEY=mee_your_api_key

# Pinata IPFS Storage
EXPO_PUBLIC_PINATA_JWT=your_pinata_jwt
EXPO_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### 3. Run Development Server

```bash
# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
market-mobile/
├── App.tsx                          # Main entry point
├── src/
│   ├── screens/
│   │   ├── RoleSelectionScreen.tsx    # Onboarding step 1
│   │   ├── UsernameSetupScreen.tsx    # Onboarding step 2
│   │   ├── WalletDisplayScreen.tsx    # Onboarding step 3
│   │   ├── FundingScreen.tsx          # Onboarding step 4
│   │   ├── DashboardScreen.tsx        # Main dashboard
│   │   └── MarketplaceScreen.tsx      # Omnichain marketplace
│   ├── hooks/
│   │   └── useOmnichainMarketplace.ts # Main marketplace hook
│   ├── lib/
│   │   ├── omnichainOrchestrator.ts   # Orchestrator setup
│   │   ├── omnichainAuthorizations.ts # EIP-7702 auth
│   │   ├── nftMarketplace.ts          # NFT operations
│   │   ├── crossChainBridge.ts        # Bridging logic
│   │   └── pinata.ts                  # IPFS uploads
│   ├── types/
│   │   ├── onboarding.ts              # Onboarding types
│   │   └── omnichain.ts               # Marketplace types
│   └── config/
├── app.json                         # Expo configuration
├── tsconfig.json                    # TypeScript config
├── babel.config.js                  # Babel config
├── metro.config.js                  # Metro bundler config
└── package.json                     # Dependencies
```

## Key Differences from Web Version

### 1. Storage
- **Web**: `localStorage`
- **Mobile**: `AsyncStorage` from `@react-native-async-storage/async-storage`

### 2. Navigation
- **Web**: React Router or manual routing
- **Mobile**: React Navigation (`@react-navigation/native`)

### 3. Image Handling
- **Web**: HTML `<input type="file">`
- **Mobile**: Expo Image Picker with native gallery access

### 4. Clipboard
- **Web**: `navigator.clipboard`
- **Mobile**: `expo-clipboard`

### 5. Environment Variables
- **Web**: `VITE_` prefix
- **Mobile**: `EXPO_PUBLIC_` prefix

### 6. Privy SDK
- **Web**: `@privy-io/react-auth`
- **Mobile**: `@privy-io/expo` (specialized for React Native)

## Mobile-Specific Features

### Image Picker

```typescript
import * as ImagePicker from 'expo-image-picker'

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
})
```

### AsyncStorage Persistence

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

// Save
await AsyncStorage.setItem('key', JSON.stringify(data))

// Load
const data = await AsyncStorage.getItem('key')
```

### Native Linking

```typescript
import { Linking } from 'react-native'

// Open URL in browser
await Linking.openURL('https://meescan.biconomy.io/...')
```

## Building for Production

### iOS

```bash
# Create build
eas build --platform ios

# Or local build
expo build:ios
```

### Android

```bash
# Create build
eas build --platform android

# Or local build
expo build:android
```

## Important Notes

### Privy Expo SDK Limitations

- No built-in funding UI for mobile (yet)
- Users must fund via web or external wallet
- Authorization signing requires special handling

### Performance Considerations

- Use FlatList for long lists (not ScrollView)
- Optimize images before upload
- Cache authorization signatures
- Use AsyncStorage sparingly

### Testing

Test on both platforms:

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Physical device via Expo Go
npm start
# Scan QR code with Expo Go app
```

## Troubleshooting

### "Buffer is not defined"

Already fixed in `App.tsx`:

```typescript
import { Buffer } from 'buffer'
global.Buffer = Buffer
```

### "Metro bundler errors"

Clear cache:

```bash
expo start --clear
```

### "Native module missing"

Rebuild:

```bash
expo prebuild --clean
```

### "AsyncStorage errors"

Ensure package is installed:

```bash
npx expo install @react-native-async-storage/async-storage
```

## Supported Chains

- Base (chainId: 8453)
- Optimism (chainId: 10)
- Polygon (chainId: 137)
- Arbitrum (chainId: 42161)
- Ethereum (chainId: 1)

## Resources

- **Expo Docs**: https://docs.expo.dev
- **Privy Expo**: https://docs.privy.io/guide/expo
- **React Navigation**: https://reactnavigation.org
- **Biconomy Docs**: https://docs.biconomy.io
- **MEE Scan**: https://meescan.biconomy.io

## License

MIT

---

**Note**: This mobile app has feature parity with the web version. All omnichain marketplace operations work identically on both platforms!
