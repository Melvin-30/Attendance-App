# 🏫 Attendance Management System

A professional React Native (Expo) application for managing student attendance with Firestore integration and Excel reporting.

## 🚀 Features

- **User Authentication**: Secure Login and Registration using Firebase Auth.
- **Class Management**: Add, view, and delete school classes.
- **Student Management**: Register students to specific classes with roll numbers.
- **Mark Attendance**: Dynamic attendance sheet with Date Picker and real-time Firestore updates.
- **Comprehensive Reports**:
    - **Monthly View**: Horizontal scrolling table showing attendance for the entire month.
    - **Daily Summaries**: Total Present/Absent counts calculated automatically.
- **Advanced Excel Export**:
    - **Monthly Export**: Generates a styled `.xlsx` file with borders and alignment.
    - **Full Report**: Generates a multi-sheet Excel workbook where each month has its own tab.
    - **Universal Support**: Works on Web (automatic download) and Mobile (native share dialog).
- **Responsive UI**: Optimized for both Android/iOS and Web views (max-width containment).

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Firebase Firestore (Database), Firebase Auth (Authentication)
- **Export Engine**: `xlsx-js-style` for formatted Excel generation
- **Navigation**: React Navigation (Native Stack)
- **File System**: `expo-file-system` & `expo-sharing`

## 🛠️ Setup Instructions

### 1. Basic Installation
1.  **Clone the repository**
2.  **Install dependencies**: `npm install`
3.  **Environment Variables**: Create a `.env` file (use `.env.example` as a template) and add your Firebase keys.

### 2. Firestore Security Rules
Go to **Firebase Console > Firestore > Rules** and apply these rules to allow version checking and secure data access:
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    // Publicly readable config for update checks
    match /config/{document} {
      allow read: if true;
      allow write: if false;
    }
    // All other data requires authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. App Update Configuration (Auto-Update)
To enable the version check feature, create the following in your Firestore:
1.  **Collection**: `config`
2.  **Document ID**: `app`
3.  **Fields**:
    - `latestVersion` (string): e.g., `"1.0.0"`
    - `updateUrl` (string): e.g., `"https://your-site.com/download"`

---

## 🏗️ Building the App

### 🤖 Build for Android (APK)
1.  **Install EAS CLI**: `npm install -g eas-cli`
2.  **Login to Expo**: `eas login`
3.  **Configure Project**: `eas build:configure`
4.  **Customize Identity**: Before building, open `app.json` to set your custom name and package ID:
    - `"name"`: The name shown on the phone home screen.
    - `"slug"`: The URL-friendly name for the Expo dashboard.
    - `"package"`: A unique ID like `com.yourname.appname`.
5.  **Build APK**:
    ```bash
    eas build --platform android --profile preview
    ```

> [!IMPORTANT]
> **Avoid Launch Crashes**: If you are using the EAS Cloud to build, your `.env` file is NOT uploaded. You MUST add your Firebase keys as **Environment Variables** in the Expo Dashboard.
> 
> **How to add in Dashboard:**
> 1. Go to **Project Settings > Environment Variables**.
> 2. Add each key from your `.env` file.
> 3. **Visibility**: Choose "Plain Text" or "Sensitive" (Firebase keys are meant to be public).
> 4. **Environment**: Select **"All Environments"** (Development, Preview, Production).
> 
> Alternatively, use the **CLI**:
> ```bash
> eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your_key"
> # ... Repeat for all keys
> ```





### 🖥️ Build for Windows (EXE)
You can create a standalone `.exe` that works offline by wrapping your local build:
1.  **Install Nativefier**: `npm install -g nativefier`
2.  **Export the web build**:
    ```bash
    npx expo export --platform web
    ```
    *This creates a `dist` folder in your project.*
3.  **Package into EXE**:
    Run this command in your terminal (replace the path with your actual project path):
    ```bash
    nativefier --name "Attendance App" "C:\Your\Project\Path\attendance-app\dist"
    ```
4.  **Find the Result**: Look for a new folder named `Attendance App-win32-x64`. Inside, you will find `Attendance App.exe`.


---

## 🏃 How to Run

- **Start Expo**: `npx expo start`
- **Run on Android**: Press `a`
- **Run on Web**: Press `w`

## 📂 Project Structure
- `/screens`: UI Pages (Login, Dashboard, Attendance, etc.).
- `/utils`: Helper functions (Excel export logic).
- `firebase.js`: Firebase config & initialization.
- `App.js`: Navigation & Version Check logic.

## 📄 License
This project is for educational/management purposes.
