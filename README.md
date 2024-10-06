# Paramithi


## How to deploy/open the app in Xcode
1. Skip to step 2 if already added.  
   run `npx cap add ios` to add an iOS project
2. Run `ionic build` to build the app
2. Run `npx cap sync` to copy projects to iOS and android project
3. Run `npx cap open ios` to open the app in Xcode


or 
```ionic cap sync```

## How to deploy/open the app in Android Studio
```npx cap run android```

## Build icon
npx @capacitor/assets generate --assetPath src/assets/


# Android

Android Manifest:  
```android/app/src/main/AndroidManifest.xml```

# iOS

Info.plist:  
```ios/App/App/Info.plist```
Privacy settings:  
```ios/App/App/PrivacyInfo.plist```

## Libraries

### Preferences
https://capacitorjs.com/docs/apis/preferences