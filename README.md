# Zahida Residency - Firebase Authentication with Role-Based Panels

A modern React application with Firebase authentication featuring a beautiful login page and role-based dashboard system with Admin and User panels.

## Features

- 🔐 **Firebase Authentication** - Username/password and Google sign-in
- 👥 **Role-Based Access** - Admin and User panels with different permissions
- 🔧 **Admin Panel** - User management, statistics, and system administration
- 👤 **User Panel** - Profile management, account information, and quick actions
- 🎨 **Modern UI/UX** - Beautiful gradient design with smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🔄 **Real-time Auth State** - Automatic login/logout state management
- 🛡️ **Secure** - Firebase security rules and best practices

## Firebase Configuration

The app is configured with the following Firebase project:
- **Project ID**: zahida-residency
- **Auth Domain**: zahida-residency.firebaseapp.com
- **Storage Bucket**: zahida-residency.firebasestorage.app

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zahida-residency
```

2. Install dependencies:
```bash
npm install
```

3. **Environment Variables Setup**:
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` file and add your Firebase configuration:
   ```env
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # App Configuration
   REACT_APP_APP_NAME=Your App Name
   REACT_APP_APP_VERSION=1.0.0
   REACT_APP_ENVIRONMENT=development
   REACT_APP_DEBUG_MODE=true
   ```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Required Variables
- `REACT_APP_FIREBASE_API_KEY` - Your Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID` - Your Firebase app ID
- `REACT_APP_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID (optional)

### Optional Variables
- `REACT_APP_APP_NAME` - Application name (default: "Zahida Residency")
- `REACT_APP_APP_VERSION` - Application version (default: "1.0.0")
- `REACT_APP_ENVIRONMENT` - Environment (development/production)
- `REACT_APP_DEBUG_MODE` - Enable debug mode (true/false)

### Security Notes
- Never commit your `.env` file to version control
- The `.env` file is already added to `.gitignore`
- Use `.env.example` as a template for other developers
- Keep your Firebase API keys secure and rotate them regularly

## Firebase Setup

### 1. Enable Authentication

1. Go to your Firebase Console
2. Navigate to Authentication > Sign-in method
3. Enable Email/Password authentication
4. Enable Google authentication
5. Add your domain to authorized domains

### 2. Configure Google Sign-in

1. In Firebase Console, go to Authentication > Sign-in method
2. Click on Google provider
3. Enable it and configure the OAuth consent screen
4. Add your authorized domains

### 3. Enable Firestore Database

1. Go to Firestore Database in Firebase Console
2. Create a new database
3. Start in test mode (for development)
4. Set up security rules as needed

## Role-Based System

### Admin Panel Features
- **User Management**: View, edit, and delete user accounts
- **Role Management**: Change user roles between admin and user
- **Statistics Dashboard**: View total users, admin count, and user count
- **User Details**: View detailed user information in modal
- **System Administration**: Full control over the application

### User Panel Features
- **Profile Management**: Edit personal information
- **Account Information**: View account details and status
- **Quick Actions**: Access to common user functions
- **Preferences**: Set personal preferences and requirements

### Role Assignment
- **First User**: Automatically prompted to become admin
- **New Users**: Default role is "user"
- **Admin Promotion**: Admins can promote other users to admin role

## Usage

### Login Page
- Users can sign in with username and password
- Users can sign up with username, email, and password
- Users can sign in with Google (username auto-generated)
- Toggle between sign-in and sign-up modes
- Real-time error handling and loading states
- Username validation (3+ characters, letters, numbers, underscores only)

### Admin Panel
- Access user management dashboard
- View system statistics
- Manage user roles and permissions
- Delete user accounts (with confirmation)
- View detailed user information including usernames

### User Panel
- Manage personal profile information
- View account details and status
- Access quick action buttons
- Edit preferences and requirements
- Display username prominently

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Login component with username-based auth
│   ├── Login.css         # Login page styles
│   ├── AdminPanel.js     # Admin dashboard component
│   ├── AdminPanel.css    # Admin panel styles
│   ├── UserPanel.js      # User dashboard component
│   ├── UserPanel.css     # User panel styles
│   ├── AdminSetup.js     # Admin promotion component
│   └── AdminSetup.css    # Admin setup styles
├── contexts/
│   └── AuthContext.js    # Authentication context provider
├── firebase.js           # Firebase configuration
├── App.js               # Main app component with role-based routing
└── index.js             # App entry point
```

## Authentication Features

### Username/Password Authentication
- User registration with username and email
- Username uniqueness validation
- Username format validation
- Secure password handling
- Error handling for invalid credentials

### Google Authentication
- One-click Google sign-in
- Automatic username generation from email
- Unique username handling for Google users
- Seamless integration with Firebase

### Role-Based Access Control
- Automatic role assignment for new users
- Admin promotion system
- Secure role-based routing

### Security
- Firebase security rules
- Protected routes based on user roles
- Secure token management
- Automatic session handling

## Database Structure

### Users Collection
```javascript
{
  uid: "user_id",
  username: "unique_username",
  email: "user@example.com",
  role: "user" | "admin",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  address: "123 Main St",
  preferences: "Special requirements...",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Username System

### Username Requirements
- Minimum 3 characters long
- Can contain letters, numbers, and underscores only
- Must be unique across all users
- Auto-generated for Google sign-in users

### Username Validation
- Real-time availability checking
- Format validation on sign-up
- Error messages for invalid usernames
- Automatic unique username generation for Google users

## Customization

### Styling
- Modify component CSS files for custom styling
- Update color schemes and gradients
- Customize responsive breakpoints

### Firebase Configuration
- Update Firebase config in `src/firebase.js`
- Add additional Firebase services as needed
- Configure security rules in Firebase Console

### Role Management
- Modify role assignment logic in AuthContext
- Add additional roles as needed
- Customize role-based permissions

### Username System
- Modify username validation rules
- Change username generation logic for Google users
- Update username display format

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
1. Install Firebase CLI:
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

4. Deploy:
```bash
firebase deploy
```

### Deploy to Vercel (Recommended)

#### Option 1: Deploy via Vercel CLI
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

#### Option 2: Deploy via Vercel Dashboard
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your repository
5. Configure environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file:
     ```
     REACT_APP_FIREBASE_API_KEY=your_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
     REACT_APP_APP_NAME=Zahida Residency
     REACT_APP_APP_VERSION=1.0.0
     REACT_APP_ENVIRONMENT=production
     REACT_APP_DEBUG_MODE=false
     ```
6. Deploy the project

#### Vercel Configuration
The project includes:
- `vercel.json` - Deployment configuration
- `.vercelignore` - Files to exclude from deployment
- Automatic routing for React Router
- Environment variable support
- Security headers
- Static file optimization

#### Environment Variables in Vercel
- **Development**: Use `.env` file locally
- **Production**: Set in Vercel Dashboard → Settings → Environment Variables
- **Preview**: Can be set per branch in Vercel Dashboard

#### Custom Domain (Optional)
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS settings as instructed
4. Enable HTTPS (automatic with Vercel)

## Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check if Firebase config is correct in `src/firebase.js`
   - Verify API keys and project settings

2. **Authentication not working**
   - Ensure Authentication is enabled in Firebase Console
   - Check authorized domains in Firebase settings
   - Verify Google OAuth configuration

3. **Username issues**
   - Check username validation rules
   - Verify username uniqueness in Firestore
   - Check username format requirements

4. **Role-based routing issues**
   - Check Firestore database is enabled
   - Verify user documents are being created
   - Check role assignment logic

5. **Styling issues**
   - Clear browser cache
   - Check CSS file imports
   - Verify responsive breakpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
