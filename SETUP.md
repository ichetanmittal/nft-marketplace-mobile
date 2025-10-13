# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   cd market-mobile
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Configure .env**
   - Get Privy App ID from https://dashboard.privy.io
   - Get Biconomy API Key from https://dashboard.biconomy.io
   - Get Pinata JWT from https://app.pinata.cloud

4. **Start Development**
   ```bash
   npm start
   ```

5. **Run on Device/Simulator**
   - iOS: Press `i` or run `npm run ios`
   - Android: Press `a` or run `npm run android`

## What's Included

✅ Complete onboarding flow (4 steps)
✅ Profile picture upload to IPFS
✅ Omnichain marketplace infrastructure  
✅ Gasless transactions (Biconomy MEE)
✅ Cross-chain NFT trading
✅ EIP-7702 smart accounts
✅ Support for 5 chains

## Next Steps

1. Test onboarding flow
2. Test marketplace initialization
3. Deploy marketplace contracts (see web app README)
4. Update `MARKETPLACE_ADDRESSES` in `src/lib/nftMarketplace.ts`
5. Test NFT listing and buying

## File Structure

```
market-mobile/
├── App.tsx                    # Entry point
├── src/
│   ├── screens/              # All screens
│   ├── hooks/                # React hooks
│   ├── lib/                  # Core logic
│   └── types/                # TypeScript types
├── package.json              # Dependencies
├── app.json                  # Expo config
└── README.md                 # Full documentation
```

## Important Notes

- This is a complete mobile implementation with ALL features from the web app
- Uses React Native, Expo, Privy Expo SDK, and Biconomy AbstractJS
- Native image picker, AsyncStorage, and React Navigation
- Fully typed with TypeScript
- Ready for iOS and Android

## Support

See README.md for detailed documentation and troubleshooting.
