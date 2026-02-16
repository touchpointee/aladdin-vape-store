# Generate your APK – one step

EAS needs you to confirm **once** to create an Android keystore. After that, future builds can run without any prompt.

## Option 1: Double‑click the script (easiest)

1. In File Explorer go to:  
   `vape-store-mobile`
2. Double‑click **`build-apk.bat`**
3. A terminal will open and the build will start.
4. When it asks: **"Generate a new Android Keystore?"**  
   → Type **Y** and press **Enter**.
5. Wait for the build to finish (~10–15 minutes). You’ll get a **link to download the APK**.

---

## Option 2: Run from Command Prompt

```cmd
cd "c:\Users\ajmal\Desktop\touchpointe\New folder\vape-store\vape-store-mobile"
build-apk.bat
```

When prompted, type **Y** and press Enter.

---

After the first run, the keystore is saved. You can run `build-apk.bat` again anytime to get a new APK; it won’t ask for the keystore again.

**Security:** Revoke the token after you’re done from:  
https://expo.dev/accounts/ajmaljs05/settings/access-tokens
