@echo off
title EAS Build - Android APK
cd /d "%~dp0"

set EXPO_TOKEN=yjE45MeO7hiDOUaN3PlpzaO1IbZ7PJGltrHghVei

echo.
echo ============================================
echo   Building Android APK (EAS Build)
echo ============================================
echo.
echo When asked: "Generate a new Android Keystore?"
echo    Type  Y  and press Enter  (only needed first time)
echo.
echo Build runs in the cloud (~10-15 min). You will get a download link when done.
echo ============================================
echo.

npx eas-cli build --platform android --profile preview

echo.
pause
