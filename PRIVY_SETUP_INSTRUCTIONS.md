# Privy Setup Instructions for React Native App

## Current Issue
Users are not appearing in the Privy dashboard because the **Client ID** is missing from the configuration.

## Steps to Fix

### 1. Get Your Privy Client ID

1. Go to the [Privy Dashboard](https://dashboard.privy.io/)
2. Select your app (or create one if you haven't)
3. Navigate to **Settings** > **App Clients**
4. Click **Create App Client** (if you don't have one already)
5. Select **Mobile** as the platform
6. Copy the generated **Client ID**

### 2. Update Configuration Files

#### a. Update `.env` file

Replace `your-privy-client-id-here` with your actual Client ID:

```env
EXPO_PUBLIC_PRIVY_APP_ID=cmgmjginy01t3jo0c2ijhylv8
EXPO_PUBLIC_PRIVY_CLIENT_ID=your-actual-client-id-from-dashboard
```

#### b. Update `app.json` file

Replace `your-privy-client-id-here` with your actual Client ID:

```json
"extra": {
  "eas": {
    "projectId": "your-project-id"
  },
  "privyAppId": "cmgmjginy01t3jo0c2ijhylv8",
  "privyClientId": "your-actual-client-id-from-dashboard"
}
```

### 3. Restart Your Development Server

After updating the configuration:

```bash
# Stop the current server (Ctrl+C)

# Clear the cache and restart
npm start -- --clear

# Or if using expo
expo start --clear
```

### 4. Test the Login Flow

1. Open the app on your device/simulator
2. Click "Sign In with Privy"
3. Complete the authentication flow
4. Go to your Privy Dashboard > Users
5. You should now see the authenticated user appear

## What Was Fixed

### Before (Not Working)
```tsx
<PrivyProvider appId={PRIVY_APP_ID}>
  {/* Missing clientId */}
</PrivyProvider>
```

### After (Working)
```tsx
<PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
  {/* Now includes clientId for mobile authentication */}
</PrivyProvider>
```

## Important Notes

1. **Client ID is Required for Mobile**: According to Privy documentation, the `clientId` is mandatory for React Native and other non-web platforms.

2. **App ID vs Client ID**:
   - **App ID**: Identifies your Privy application
   - **Client ID**: Identifies the specific client (mobile, web, etc.) within your app

3. **Security**: While these IDs are in your `.env` file, make sure to add `.env` to your `.gitignore` to avoid committing sensitive data.

4. **Restart Required**: Changes to `app.json` and environment variables require a full restart of the Expo dev server with cache clearing.

## Verification Checklist

- [ ] Client ID obtained from Privy Dashboard
- [ ] `.env` file updated with actual Client ID
- [ ] `app.json` updated with actual Client ID
- [ ] Development server restarted with `--clear` flag
- [ ] Login flow tested successfully
- [ ] User appears in Privy Dashboard

## Additional Resources

- [Privy React Native Setup Documentation](https://docs.privy.io/basics/react-native/setup)
- [Creating App Clients](https://docs.privy.io/guide/console/app-clients)
- [Privy Dashboard](https://dashboard.privy.io/)

## Troubleshooting

### Users Still Not Appearing in Dashboard

1. Verify the Client ID is correct (no extra spaces or characters)
2. Ensure you're using the mobile/native Client ID (not the web one)
3. Check the browser console or React Native debugger for any Privy errors
4. Make sure your app is using the correct Privy App ID
5. Verify your app's bundle ID matches what's configured in Privy Dashboard

### Authentication Errors

If you see authentication errors:
- Double-check both `appId` and `clientId` are set correctly
- Ensure you've created an app client specifically for mobile in the Privy Dashboard
- Try clearing AsyncStorage and re-authenticating
