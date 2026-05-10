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

## 📦 Installation

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Firebase**:
    - The app is already configured with a Firebase project.
    - Ensure your Firestore rules allow read/write access for authenticated users.
    - Recommended rules:
      ```js
      service cloud.firestore {
        match /databases/{database}/documents {
          match /{document=**} {
            allow read, write: if request.auth != null;
          }
        }
      }
      ```

## 🏃 How to Run

- **Start Expo**: `npx expo start`
- **Run on Android**: Press `a` in the terminal or use the Expo Go app.
- **Run on Web**: Press `w` in the terminal.

## 📂 Project Structure

- `/screens`: Contains all the UI pages (Login, Dashboard, Attendance, etc.).
- `/utils`: Helper functions, including the Excel export logic.
- `firebase.js`: Centralized Firebase configuration and initialization.
- `App.js`: Navigation setup and screen registration.

## 📄 License
This project is for educational/management purposes.
