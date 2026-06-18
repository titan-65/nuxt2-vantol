---
title: "Deploying React Native/Expo Apps to the Google Play Store"
description: "A step-by-step guide to publishing a React Native or Expo app on the Google Play Store — Play Console setup, AAB vs APK, Google Play App Signing, store listing metadata, and ongoing release management."
date: 2026-06-17
tag: "Application Development"
img: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 9
keywords: [react-native, expo, android, play-store, deployment, mobile, app-bundle, code-signing]
language: "TypeScript"
---

# Deploying React Native/Expo Apps to the Google Play Store

## Introduction

Deploying a React Native or Expo app to the Google Play Store opens up your application to billions of Android users worldwide. While the Android ecosystem is generally more permissive than Apple's, the Play Store submission process still requires careful preparation and adherence to Google's policies.

In this comprehensive guide, I'll walk you through the entire Android deployment journey, from setting up your Google account to publishing your app on the Play Store. Whether you're a seasoned developer or just starting with React Native/Expo, you'll learn everything you need to know to get your app on the Play Store.

## Table of Contents

1. [Setting Up Your Google Play Console Account](#setting-up-your-google-play-console-account)
2. [Configuring Your Project for Android](#configuring-your-project-for-android)
3. [Preparing App Bundles and APKs](#preparing-app-bundles-and-apks)
4. [Setting Up Google Play App Signing](#setting-up-google-play-app-signing)
5. [Preparing for Play Store Submission](#preparing-for-play-store-submission)
6. [Submitting to the Play Store](#submitting-to-the-play-store)
7. [Post-Submission and Maintenance](#post-submission-and-maintenance)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Conclusion](#conclusion)

## Setting Up Your Google Play Console Account

Before you can deploy to the Play Store, you need a Google Play Console account. There are two types:

- **Free Developer Console** ($25 one-time registration fee)
- **Google Play for Teams** (additional features for organizations)

For most individual developers, the free developer console is sufficient.

### Required Assets

When you register, you'll need to set up:

1. **Google Account** (your primary account)
2. **Developer Account** (with payment information)
3. **Project Name** (your company's/project name)
4. **Privacy Policy** (required for all apps)

### Getting Started with the Play Console

1. Visit [play.google.com/console](https://play.google.com/console)
2. Sign in with your Google Account
3. Complete the developer registration process
4. Navigate to the **My apps** section

## Configuring Your Project for Android

Once you have your Google Play Console account set up, you need to configure your React Native or Expo project for Android deployment.

### Project Structure

For React Native projects:

```bash
my-app/
├── android/
├── ios/
├── package.json
└── App.js
```

For Expo projects:

```bash
my-expo-app/
├── app.json
├── package.json
├── .gitignore
└── expo-modules.config.json
```

### Android-Specific Configuration

#### React Native (Bare Workflow)

For React Native projects, you'll need to configure the Android project in the `android/` directory:

1. **Update `AndroidManifest.xml`**
2. **Configure `build.gradle` files**
3. **Set up app signing**

#### Expo (Managed Workflow)

Expo makes Android configuration much simpler. Most settings are handled through `app.json`:

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.yourapp",
      "versionCode": 1,
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

## Preparing App Bundles and APKs

Google Play requires you to upload app bundles (`.aab`) for internal testing and production, while APKs (`.apk`) are still needed for some older devices and testing.

### App Bundles (.aab)

App bundles are the preferred format for Play Store distribution because:

1. **Smaller download sizes** - Google strips out only the resources your device needs
2. **Faster installs** - Optimized for different device configurations
3. **Better user experience** - Reduced app size and faster updates

### APKs (.apk)

APKs are still needed for:

1. **Older devices** that don't support app bundles
2. **Enterprise distribution** in some cases
3. **Sideload testing**

### Building Your App

#### React Native

```bash
# Build app bundle for production
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --sourcemap-output android/app/src/main/assets/index.android.bundle.map

# Build APK
cd android && ./gradlew assembleRelease

# Build App Bundle
cd android && ./gradlew bundleRelease
```

#### Expo

```bash
# Build for production
npx expo export --platform android --dev false

# Build APK
npx expo build:android --release

# Build App Bundle
npx expo build:android --type app-bundle
```

## Setting Up Google Play App Signing

Google Play App Signing automatically re-signs your app with Google's certificate when you upload to the Play Store, ensuring your app remains secure and up-to-date.

### Benefits

1. **Automatic security updates** - Google handles certificate rotation
2. **Reduced maintenance** - No need to manage your own signing keys
3. **Better user experience** - Seamless updates without reinstallation

### Setup Process

1. **Enable Google Play App Signing** in the Play Console
2. **Upload your app's signing certificate** (or let Google generate one)
3. **Configure your build to use Google's signing**

### Code Signing in React Native

For React Native projects, update your `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.yourapp"
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            } else {
                // Use Google's signing configuration
                v1Enabled true
                v2Enabled true
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig release.signingConfigs.debug
        }
    }
}
```

### Code Signing in Expo

Expo handles Google Play App Signing automatically. Just ensure your `app.json` includes the necessary configuration:

```json
"android": {
  "package": "com.yourcompany.yourapp",
  "versionCode": 1,
  "googleServicesFile": "./google-services.json",
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#ffffff"
  }
}
```

## Preparing for Play Store Submission

Before you can submit your app to the Play Store, you need to ensure it's ready for review.

### Play Store Connect Requirements

Your app must meet several requirements:

1. **Package Name**
   - Must match the one registered in the Play Console
   - Format: `com.companyname.appname`

2. **Version Number**
   - Must follow semantic versioning (major.minor.patch)

3. **Version Code**
   - Must be a positive integer
   - Should increment with each update

4. **App Name**
   - Must be between 1 and 50 characters
   - Cannot contain prohibited words

### App Metadata

Prepare the following metadata for your app:

1. **App Icon**
   - 512×512 pixels (PNG)
   - Must be square
   - Should be clear and readable

2. **App Screenshots**
   - Various screen sizes and orientations
   - Include at least 2-3 screenshots
   - Show key features and user interface

3. **App Description**
   - Brief description: 20-30 characters
   - Full description: 100-500 characters
   - Include relevant keywords
   - Highlight key features

4. **Privacy Policy**
   - Required for all apps
   - Must be accessible from the Play Store listing

### Testing Your App

Before submitting, thoroughly test your app:

1. **Unit Tests**
   - Ensure core functionality works
   - Test edge cases

2. **Integration Tests**
   - Test with real devices
   - Test with different Android versions

3. **Google Play App Testing**
   - Use Google Play's internal testing groups
   - Collect feedback from testers

## Submitting to the Play Store

Once your app is ready, you can submit it to the Play Store.

### Step-by-Step Submission Process

1. **Create App in Play Console**
   - Log in to [Google Play Console](https://play.google.com/console)
   - Click "Add new app"
   - Enter your app's package name

2. **Upload App Binary**
   - Build your app for distribution
   - Upload the .aab file (preferred) or .apk

3. **Fill Out App Metadata**
   - App title, short description, full description
   - Category and tags
   - Privacy policy URL
   - App icon and screenshots

4. **Set Pricing and Distribution**
   - Choose your pricing model (free or paid)
   - Select countries where you want to distribute
   - Configure device compatibility

5. **Review and Submit**
   - Review all requirements
   - Submit for review

6. **Wait for Review**
   - Google typically reviews apps within 24-72 hours
   - You can track the review status in Play Console

### Common Submission Issues

- **Play Store Rejection Reasons**
  - Read the rejection email carefully
  - Address all issues before resubmitting
  - Common reasons include crashes, privacy policy issues, and missing metadata

- **Review Delays**
  - Be patient during the review process
  - Contact Google support if there are delays

## Post-Submission and Maintenance

After your app is approved, you need to manage its presence on the Play Store.

### Publishing Your App

1. **Release to Production**
   - Set your app to "Published"
   - Choose your release date

2. **Monitor Performance**
   - Track downloads and ratings
   - Monitor user feedback

3. **Update Regularly**
   - Fix bugs promptly
   - Add requested features
   - Update app metadata

### Play Store Optimization (ASO)

Optimize your app listing for better visibility:

1. **Keywords**
   - Research relevant keywords
   - Include them in your app description

2. **Metadata**
   - Use compelling app title
   - Write engaging description

3. **Screenshots**
   - Update screenshots regularly
   - Show new features

## Troubleshooting Common Issues

### Common Problems and Solutions

1. **App Signing Issues**
   - Use Google Play App Signing
   - Ensure proper certificate management

2. **Build Failures**
   - Check for missing dependencies
   - Update to the latest React Native/Expo version

3. **Play Store Rejection**
   - Read the rejection email carefully
   - Fix all issues before resubmitting

4. **Performance Issues**
   - Optimize app startup time
   - Reduce memory usage

### Getting Help

If you encounter issues:

1. **Google Play Developer Support**
   - Submit a support request through Play Console

2. **Stack Overflow**
   - Search for existing solutions

3. **React Native/Expo Community**
   - Join Discord or other communities

## Conclusion

Deploying a React Native or Expo app to the Google Play Store opens up your application to billions of Android users. While the process has some differences from iOS deployment, it follows a similar pattern of preparation, testing, and submission.

Remember that the Play Store submission process is thorough, but with proper preparation and attention to detail, you can get your app approved and available to users worldwide.

The key to success is:

1. **Proper Planning** - Understand all requirements before starting
2. **Thorough Testing** - Test your app thoroughly before submission
3. **Attention to Detail** - Pay attention to metadata and requirements
4. **Patience** - The review process takes time

Good luck with your Play Store deployment!

---

*This guide covers the deployment process for both React Native (bare workflow) and Expo (managed workflow). For specific issues with your particular setup, consult the official documentation for your framework.*
