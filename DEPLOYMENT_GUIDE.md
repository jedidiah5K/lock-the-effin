# Lock The Eff In - Deployment Guide

This guide will walk you through the steps to deploy your "Lock The Eff In" application so that your friends can create accounts and use the website.

## Prerequisites

Before you begin, make sure you have:

1. A Firebase account (free tier is sufficient)
2. A GitHub account (for source code management)
3. A Vercel, Netlify, or Firebase Hosting account (for deployment)

## Step 1: Set Up Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable the following services:
   - Authentication (Email/Password and Google Sign-In)
   - Firestore Database
   - Storage (for user uploads)

### Configure Authentication

1. In the Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
4. Add your domain to the **Authorized domains** list once you've deployed your app

### Set Up Firestore Database

1. Go to **Firestore Database** and create a database
2. Start in production mode
3. Choose a location closest to your target audience
4. Set up the following security rules in the **Rules** tab:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /notes/{noteId} {
      allow read, write: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
    match /habits/{habitId} {
      allow read, write: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
    match /events/{eventId} {
      allow read, write: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## Step 2: Configure Firebase in Your App

1. In the Firebase Console, go to **Project Settings** → **General**
2. Scroll down to **Your apps** and click the Web icon (</>) to add a web app
3. Register your app with a nickname (e.g., "Lock The Eff In")
4. Copy the Firebase configuration object
5. Create a `.env` file in your project root with the following content:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

6. Replace the placeholders with your actual Firebase configuration values
7. Update the `src/firebase.ts` file to use these environment variables

## Step 3: Prepare Your App for Production

1. Install dependencies and check for any TypeScript errors:

```bash
npm install
npm run build
```

2. Fix any TypeScript errors that appear during the build process
3. Test your application locally:

```bash
npm start
```

4. Make sure all features work correctly, including:
   - User authentication (login/register)
   - Notes creation and editing
   - Task management
   - Habit tracking
   - Calendar events
   - Money tracking
   - Global search functionality

## Step 4: Deploy to a Hosting Service

### Option 1: Deploy to Vercel (Recommended)

1. Create an account on [Vercel](https://vercel.com/)
2. Install the Vercel CLI:

```bash
npm install -g vercel
```

3. Run the following command in your project directory:

```bash
vercel
```

4. Follow the prompts to deploy your application
5. Add your environment variables in the Vercel dashboard

### Option 2: Deploy to Netlify

1. Create an account on [Netlify](https://www.netlify.com/)
2. Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

3. Run the following command in your project directory:

```bash
netlify deploy
```

4. Follow the prompts to deploy your application
5. Add your environment variables in the Netlify dashboard

### Option 3: Deploy to Firebase Hosting

1. Install the Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase Hosting:

```bash
firebase init hosting
```

4. Deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

## Step 5: Share with Friends

1. Share your deployed URL with friends
2. They can create accounts using the registration page
3. Each user will have their own private data space in Firebase

## Troubleshooting

### Authentication Issues

- Make sure your Firebase Authentication service is properly configured
- Add your deployed domain to the authorized domains list in Firebase Authentication settings

### Database Access Issues

- Check your Firestore security rules to ensure they allow proper access
- Verify that your Firebase configuration is correctly set up in your app

### Deployment Issues

- Check the build logs for any errors
- Ensure all environment variables are properly set in your hosting service

## Maintenance and Updates

1. To update your deployed app, make changes to your codebase
2. Build the app again:

```bash
npm run build
```

3. Deploy the updated version using the same deployment command you used initially

## Scaling Considerations

The free tier of Firebase should be sufficient for personal use and sharing with friends. However, if your user base grows significantly, consider:

1. Upgrading to a paid Firebase plan
2. Implementing more advanced security rules
3. Setting up proper backup procedures for your data

## Need Help?

If you encounter any issues during deployment, refer to the following resources:

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

Good luck with your deployment! Your friends will love using "Lock The Eff In" to boost their productivity.
