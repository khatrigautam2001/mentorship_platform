# Mentorship Progress Tracker - Local Setup Guide

Follow these step-by-step instructions to run the application locally on your computer.

## Step 1: Download the Project

1. Go to your Replit project
2. Click the three dots menu (⋯) in the top right
3. Select **"Download as zip"**
4. Wait for the download to complete

## Step 2: Extract the Project

1. Find the downloaded zip file on your computer (usually in Downloads folder)
2. Right-click the zip file
3. Select **"Extract All"** (Windows) or **"Open"** (Mac)
4. Choose a location where you want to store the project (example: `C:\Users\YourName\Documents\mentorship-tracker`)
5. Wait for extraction to complete

## Step 3: Open Terminal/Command Prompt

1. **Windows:** 
   - Open the extracted folder
   - Click on the address bar at the top
   - Type `cmd` and press Enter
   
2. **Mac/Linux:**
   - Open Terminal from Applications > Utilities
   - Type: `cd /path/to/extracted/folder` and press Enter

## Step 4: Check if Node.js is Installed

1. In terminal, type: `node --version`
2. If you see a version number (like `v18.0.0`), Node.js is installed ✓
3. If you get "command not found", download Node.js from https://nodejs.org (download the LTS version)

## Step 5: Install Project Dependencies

1. In the terminal (make sure you're in the project folder)
2. Type: `npm install`
3. Wait for all packages to download (this takes 2-5 minutes)
4. When done, you'll see a list of installed packages

## Step 6: Create Database Configuration

1. The project uses PostgreSQL. You have two options:

   **Option A: Use a local PostgreSQL database (Recommended for development)**
   - Install PostgreSQL from https://www.postgresql.org/download/
   - During installation, remember the password you set for the `postgres` user
   - After installation, create a file named `.env.local` in your project folder
   - Copy this content into `.env.local`:
     ```
     DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mentorship_tracker
     ```
   - Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation

   **Option B: Use the Replit database (Easier)**
   - Get the DATABASE_URL from your Replit project (Secrets tab)
   - Create a file named `.env.local` in your project folder
   - Copy this content into `.env.local`:
     ```
     DATABASE_URL=postgresql://user:password@host:port/database
     ```
   - Replace with your actual Replit database credentials

2. Save the `.env.local` file

## Step 7: Initialize the Database

1. In terminal, type: `npm run db:push`
2. This creates all necessary tables in your database
3. Wait for completion

## Step 8: Start the Application

1. In terminal, type: `npm run dev`
2. You should see output like:
   ```
   [express] serving on port 5000
   ```
3. This means the application is running!

## Step 9: Open in Browser

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Go to: `http://localhost:5000`
3. You should see the Mentorship Progress Tracker login page

## Step 10: Create an Account or Login

1. **First Time?** Click on **"Sign Up"**
2. Fill in the form with:
   - Email: your email address
   - Password: a strong password (at least 6 characters)
   - User Type: Choose **"Mentor"** or **"Mentee"**
3. Click **"Sign Up"**
4. You'll be redirected to the dashboard

## Step 11: Stop the Application

When you're done using the application:
1. Go to the terminal where you ran `npm run dev`
2. Press `Ctrl + C`
3. The application will stop

## Troubleshooting

### Issue: "Port 5000 is already in use"
- Solution: Close any other applications using port 5000
- Or change the port in `server/index-dev.ts`

### Issue: "npm command not found"
- Solution: Node.js is not installed. Download from https://nodejs.org

### Issue: Database connection error
- Solution: Check your `.env.local` file and make sure DATABASE_URL is correct

### Issue: Dependencies installation fails
- Solution: Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again

### Issue: "Module not found" errors
- Solution: Make sure you ran `npm install` successfully before running `npm run dev`

## Next Steps After Login

- **Mentors:** Create roadmaps and add mentees
- **Mentees:** View your learning journey and request mock interviews
- Check the application for all available features

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Check terminal output for error details
3. Make sure all steps were followed in order
