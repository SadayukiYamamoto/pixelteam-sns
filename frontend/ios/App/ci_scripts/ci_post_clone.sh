#!/bin/zsh

# CI_PRIMARY_REPOSITORY_PATH is provided by Xcode Cloud as the root of the repository.
# We need to navigate to the frontend directory to run npm and capacitor commands.

set -e

echo "🚀 Starting ci_post_clone script..."

# Move to frontend directory
cd "${CI_PRIMARY_REPOSITORY_PATH}/frontend"

# Check Node.js version
node -v
npm -v

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the web app
echo "🏗️ Building web app..."
npm run build

# Sync Capacitor (this prepares the ios/App/public folder and scales to native projects)
echo "🔄 Syncing Capacitor for iOS..."
npx cap sync ios

echo "✅ ci_post_clone script finished!"
