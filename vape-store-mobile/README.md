# Vape Store – Customer Mobile App (React Native / Expo)

Customer-facing React Native app with the same flow as the vape-store Next.js web app. **Frontend only**; it talks to your existing Next.js backend.

## Backend URL (required)

Set your Next.js backend URL in environment variables so the app can call the API.

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set your backend URL (no trailing slash):
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```
   For a real device, use your machine’s IP (e.g. `http://192.168.1.10:3000`) or your deployed URL (e.g. `https://your-domain.com`).

Expo injects `EXPO_PUBLIC_*` at build time, so restart the dev server after changing `.env`.

## Run

```bash
cd vape-store-mobile
npm install
npx expo start
```

Then press `a` for Android or `i` for iOS simulator, or scan the QR code with Expo Go.

**Web:** Run `npx expo start --web` (or press `w` after `npx expo start`). If you see a blank page and "500" / "MIME type application/json" in the browser console:
1. Stop the server (Ctrl+C), then run **with cache clear**: `npx expo start --web --clear`
2. Ensure `expo-font` is installed (required by `@expo/vector-icons`): `npx expo install expo-font`
3. Open the URL shown in the terminal (e.g. http://localhost:8081).

## Flow (matches web customer app)

| Feature | Web | Mobile |
|--------|-----|--------|
| **Home** | Categories, new arrivals, brands, hot, top selling, search bar | Same + working search → Products with query |
| **Products** | Search, category/brand/isHot/isNewArrival/isTopSelling, sort (newest, price asc/desc), infinite scroll | Same; sort chips (Newest, Price Low→High, High→Low) |
| **Product detail** | Image, price, flavour, nicotine/variants, quantity, Add to Cart, Buy Now, WhatsApp | Same |
| **Cart** | Drawer: items, qty, remove, subtotal, Checkout | Screen: same behaviour |
| **Checkout** | Saved addresses, new address form, COD / Prepaid (QR + UTR), delivery ₹100, order summary | Same; payment_qr_code & payment_settings from API |
| **Orders** | List by phone, status badges, order detail with items, address, payment, tracking refresh | Same; track API refresh when AWB present |
| **Account** | Login (phone), profile, addresses, wishlist, help, logout | Same |
| **Login** | Phone only, then redirect to account | Same |
| **Profile** | Name, email, phone edit | Same |
| **Addresses** | List, add/edit/delete, form (name, phone, email, address, landmark, city, state, pincode, age) | Same |
| **Wishlist** | List from IDs, remove, add to cart | Same |
| **Help** | WhatsApp, Call, Email, FAQs | Same (WhatsApp from settings; Call/Email placeholders) |

No admin/portal screens; customer app only.

## Building an APK

You can generate an installable Android APK in two ways.

### Option 1: EAS Build (recommended, no Android Studio needed)

1. Log in to Expo (one-time; create a free account at [expo.dev](https://expo.dev) if needed):
   ```bash
   npx eas-cli login
   ```
2. Build the APK:
   ```bash
   npm run build:apk
   ```
   When the build finishes, Expo gives you a link to **download the APK**. Install it on your device (enable “Install from unknown sources” if prompted).

### Option 2: Local build (requires JDK + Android Studio / SDK)

1. Install **JDK 17** and set `JAVA_HOME` to the JDK folder.
2. Install **Android Studio** (or at least the Android SDK) and set `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) to the SDK path.
3. Generate the native project (already done if you have an `android` folder):
   ```bash
   npx expo prebuild --platform android --no-install
   ```
4. Build the release APK:
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```
   The APK is at: `android\app\build\outputs\apk\release\app-release.apk`.

## Tech

- Expo SDK 51, React Native
- React Navigation (tabs + stack)
- Zustand + AsyncStorage (cart, auth, wishlist)
- API client in `src/api` using `EXPO_PUBLIC_API_URL`
