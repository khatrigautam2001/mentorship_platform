# Mentorship Progress Tracker - Detailed Local Setup Guide

This guide will walk you through every single step to get the application running on your computer using Neon (online PostgreSQL database).

---

## STEP 1: Download the Project from Replit

### What you need:
- Access to the Replit project
- Your computer with a web browser

### Detailed Instructions:

1. **Open your Replit project** in your web browser
   - Go to https://replit.com and log in
   - Find your "Mentorship Progress Tracker" project
   - Click to open it

2. **Click the three dots menu**
   - Look at the TOP RIGHT corner of the Replit interface
   - You'll see three dots (⋯) or three horizontal lines
   - Click on it

3. **Select "Download as zip"**
   - A dropdown menu will appear
   - Find and click "Download as zip"
   - Your browser will start downloading a file

4. **Wait for download to complete**
   - Look at your browser's download bar (usually bottom of screen)
   - The file will be named something like `replit-project.zip`
   - Wait until it shows "Download complete"

---

## STEP 2: Extract the Downloaded File

### What you need:
- The downloaded zip file
- Windows Explorer (Windows) or Finder (Mac)

### For Windows Users:

1. **Find the downloaded file**
   - Open File Explorer (Windows key + E)
   - Click on "Downloads" in the left sidebar
   - Look for a file named `replit-project.zip`

2. **Right-click on the zip file**
   - Place your cursor on the zip file
   - Click your right mouse button
   - A context menu will appear

3. **Select "Extract All"**
   - In the menu that appeared, click "Extract All..."
   - A dialog box will open

4. **Choose extraction location**
   - You'll see a text field with a folder path
   - Click "Browse" to choose where to save
   - Select a location (example: C:\Users\YourName\Documents)
   - Click "Select Folder"

5. **Click "Extract"**
   - In the dialog box, click the "Extract" button
   - Wait for the file to be extracted (you'll see a progress bar)
   - When done, a new folder will appear with all the project files

### For Mac Users:

1. **Find the downloaded file**
   - Open Finder
   - Click on "Downloads" in the sidebar
   - Look for `replit-project.zip`

2. **Double-click the zip file**
   - The file will automatically extract
   - A folder named `replit-project` (or similar) will appear

3. **Move the folder** (optional)
   - You can move this folder to a better location
   - Drag it to your Documents folder or Desktop

---

## STEP 3: Open Command Prompt or Terminal

### For Windows Users:

1. **Open File Explorer**
   - Press Windows key + E on your keyboard

2. **Navigate to your project folder**
   - Find the extracted project folder (from Step 2)
   - Double-click to open it
   - You should see folders named `client`, `server`, `shared`, etc.

3. **Open Command Prompt here**
   - Click on the address bar at the TOP of the window
   - It shows the folder path (like C:\Users\YourName\Documents\replit-project)
   - Type: `cmd`
   - Press Enter
   - A Command Prompt window will open

4. **Verify you're in the right folder**
   - In the command prompt, type: `dir`
   - Press Enter
   - You should see folders: `client`, `server`, `shared`, `node_modules` (if exists)

### For Mac Users:

1. **Open Terminal**
   - Press Command + Space
   - Type: `terminal`
   - Press Enter
   - Terminal will open

2. **Navigate to your project folder**
   - Type this command:
     ```
     cd ~/Documents/replit-project
     ```
   - Replace `replit-project` with your actual folder name
   - Press Enter

3. **Verify you're in the right folder**
   - Type: `ls`
   - Press Enter
   - You should see: `client`, `server`, `shared`, and other folders

---

## STEP 4: Check if Node.js is Installed

### What you need:
- The terminal/command prompt (from Step 3)

### Detailed Instructions:

1. **Type the version check command**
   - In your terminal, type: `node --version`
   - Press Enter

2. **Check the result**
   - **If you see a version** (like `v18.14.0` or `v20.10.0`):
     - Great! Node.js is installed ✓
     - You can skip to Step 5
   
   - **If you see "command not found" or "node is not recognized"**:
     - Node.js is NOT installed
     - Go to https://nodejs.org
     - Click the LTS (Long Term Support) button - usually on the left
     - Download the installer for your operating system
     - Run the installer and follow the installation wizard
     - Accept all default options
     - At the end, restart your computer
     - After restart, open terminal again and repeat the `node --version` command

3. **Also check npm (Node Package Manager)**
   - Type: `npm --version`
   - Press Enter
   - You should see a version number (like `9.8.1`)

---

## STEP 5: Install Project Dependencies

### What you need:
- Terminal/command prompt (from Step 3)
- Node.js installed (from Step 4)

### Detailed Instructions:

1. **Make sure you're in the project folder**
   - Your terminal should show the path with `replit-project`
   - If not, repeat Step 3

2. **Run the install command**
   - Type: `npm install`
   - Press Enter

3. **What happens next**
   - Your terminal will show lots of lines
   - It will say "added X packages, took Y seconds"
   - This takes 2-5 minutes depending on your internet speed
   - You'll see a progress bar or percentage

4. **When installation is complete**
   - You should see something like:
     ```
     added 850 packages in 2m
     ```
   - Your command prompt cursor will appear again
   - If you see red errors, something went wrong - check the error message

5. **Verify installation**
   - Type: `ls node_modules` (Mac) or `dir node_modules` (Windows)
   - Press Enter
   - You should see many folder names
   - This confirms dependencies are installed

---

## STEP 6: Set Up Online Database with Neon

### Why Neon?
- Neon is a managed PostgreSQL database service
- Works perfectly for this application
- Free tier available
- No need to install PostgreSQL locally

### Detailed Instructions:

1. **Create a Neon account**
   - Open your web browser
   - Go to https://neon.tech
   - Click "Sign Up" button
   - Enter your email address
   - Create a password
   - Click "Sign Up"
   - Verify your email by clicking the link sent to you

2. **Create a new project in Neon**
   - After logging in, you'll see the Neon dashboard
   - Click "Create Project"
   - Give it a name: `mentorship-tracker`
   - Select the region closest to you
   - Click "Create Project"
   - Wait for the project to be created (takes about 30 seconds)

3. **Get your database connection string**
   - In the Neon dashboard, you'll see your project
   - Click on "Connection" or "Connection String"
   - Look for the "Connection String" section
   - You'll see something like:
     ```
     postgresql://user:password@host:port/database
     ```
   - Click the copy button next to it (or select and copy manually)
   - This is your DATABASE_URL

4. **Important: Make a note**
   - Copy this string somewhere safe (notepad)
   - You'll need it in the next step
   - Example format:
     ```
     postgresql://neondb_owner:abc123xyz@ep-xyz.us-east-4.aws.neon.tech:5432/neondb
     ```

---

## STEP 7: Create the .env.local File

### What you need:
- Your DATABASE_URL from Step 6
- A text editor (Notepad, VS Code, or any text editor)
- The project folder open

### Detailed Instructions:

1. **Open your text editor**
   - Windows: Right-click in your project folder → "New" → "Text Document"
   - Mac: Open TextEdit from Applications

2. **Create the .env.local file**
   - In your text editor, paste this:
     ```
     DATABASE_URL=postgresql://YOUR_CONNECTION_STRING_HERE
     ```
   
3. **Replace with your actual connection string**
   - Delete `YOUR_CONNECTION_STRING_HERE`
   - Paste the DATABASE_URL from Step 6
   - Example of what it should look like:
     ```
     DATABASE_URL=postgresql://neondb_owner:abc123xyz@ep-xyz.us-east-4.aws.neon.tech:5432/neondb
     ```

4. **Save the file**
   - Windows: Click "File" → "Save As"
   - Mac: Press Command + S
   - **Important**: Change the filename to `.env.local` (note the dot at the beginning)
   - Save location: Inside your project folder (same level as `package.json`)
   - Click "Save"

5. **Verify the file was saved**
   - Go back to your project folder in File Explorer/Finder
   - You should see `.env.local` file
   - On Windows, it might show as a file without extension
   - On Mac, check View options if you don't see the dot files

---

## STEP 8: Initialize the Database

### What you need:
- Terminal/command prompt with your project folder open
- The .env.local file created (from Step 7)

### Detailed Instructions:

1. **Go back to your terminal**
   - Make sure you're still in your project folder
   - If you closed it, repeat Step 3

2. **Run the database setup command**
   - Type: `npm run db:push`
   - Press Enter

3. **What happens**
   - Your terminal will connect to your Neon database
   - It will create all necessary tables
   - You should see messages like:
     ```
     ✓ [drizzle-kit] Your migration is ready
     ✓ [drizzle-kit] Changes applied to database
     ```

4. **If you see an error**
   - Check that your `.env.local` file has the correct DATABASE_URL
   - Make sure you have internet connection
   - Make sure Neon account is active

5. **When complete**
   - Your cursor will appear again in the terminal
   - The database is now ready with all tables

---

## STEP 9: Start the Development Server

### What you need:
- Terminal/command prompt in project folder
- All previous steps completed

### Detailed Instructions:

1. **Run the development server**
   - In terminal, type: `npm run dev`
   - Press Enter

2. **What you should see**
   - Terminal will show:
     ```
     > npm run dev
     > rest-express@1.0.0 dev
     > NODE_ENV=development tsx server/index-dev.ts
     ```
   - Wait a few seconds
   - You should see:
     ```
     [express] serving on port 5000
     ```

3. **Important notes**
   - DO NOT close this terminal window
   - The server needs to stay running
   - You'll use another terminal/browser for the next steps

4. **If something went wrong**
   - Check if port 5000 is already in use
   - Check the error message in the terminal
   - Look at the troubleshooting section below

---

## STEP 10: Open the Application in Your Browser

### What you need:
- A web browser (Chrome, Firefox, Safari, Edge, etc.)
- The server running from Step 9

### Detailed Instructions:

1. **Open a new browser tab**
   - Press Ctrl + T (Windows) or Command + T (Mac)
   - Or just open your browser

2. **Type the local address**
   - In the address bar, type: `http://localhost:5000`
   - Press Enter

3. **Wait for the page to load**
   - It will take 2-5 seconds
   - You should see the Mentorship Progress Tracker login page
   - The page has a login form with Email and Password fields

4. **If the page doesn't load**
   - Check that the terminal shows "[express] serving on port 5000"
   - Check your internet connection
   - Try refreshing the page (F5)
   - Wait 10 seconds and try again

---

## STEP 11: Create Your Account

### What you need:
- The application loaded in browser from Step 10
- An email address
- A strong password

### Detailed Instructions:

1. **Find the Sign Up link**
   - On the login page, look for a link that says "Sign Up" or "Create Account"
   - Click on it

2. **Fill in the sign-up form**
   - **Email field**: Enter your email address (example: yourname@gmail.com)
   - **Password field**: Enter a strong password (at least 8 characters, mix of letters and numbers)
   - **Confirm Password**: Repeat your password
   - **User Type**: Choose either:
     - "Mentor" - if you're managing mentees and roadmaps
     - "Mentee" - if you're learning through a roadmap

3. **Click Sign Up button**
   - After filling all fields, click the "Sign Up" button
   - The page will process your request

4. **What happens next**
   - You should be redirected to the dashboard
   - You'll see your role's specific interface
   - You're now logged in!

---

## STEP 12: Verify Everything Works

### Detailed Instructions:

1. **If you're a Mentor**
   - You should see a dashboard to manage roadmaps
   - You can see options to create roadmaps and add mentees
   - Try clicking around to explore

2. **If you're a Mentee**
   - You should see your learning journey
   - You can see skills to learn
   - You can see progress and badges

3. **Check the browser console for errors**
   - Press F12 on your keyboard
   - Look at the "Console" tab
   - If you see red errors, note them down

4. **Keep the terminal running**
   - Your development server needs to keep running
   - Don't close the terminal window
   - You can minimize it

---

## STEP 13: Stop the Application

### When you're done for the day:

1. **Go back to your terminal**
   - Find the terminal where you ran `npm run dev`
   - Click on it to make it active

2. **Stop the server**
   - Press Ctrl + C (on Windows or Mac)
   - You'll see a message like "^C"

3. **Verify it stopped**
   - The terminal cursor should appear again
   - You can now close the terminal

4. **Your application is now stopped**
   - The website at localhost:5000 will no longer work
   - Your database remains intact in Neon
   - You can restart it anytime with `npm run dev`

---

## Troubleshooting

### Issue 1: "Port 5000 is already in use"

**What it means:** Another application is using port 5000

**Solution:**
1. Find what's using the port:
   - Windows: `netstat -ano | findstr :5000`
   - Mac: `lsof -i :5000`
2. Close the other application
3. Or, change the port in the code:
   - Open `server/index-dev.ts`
   - Find `5000` and change to `5001`
   - Save and try again

---

### Issue 2: "npm: command not found"

**What it means:** Node.js is not installed or not in your system PATH

**Solution:**
1. Go to https://nodejs.org
2. Download the LTS version
3. Run the installer
4. Restart your computer
5. Open a new terminal and try again

---

### Issue 3: "Database connection error"

**What it means:** The .env.local file or DATABASE_URL is incorrect

**Solution:**
1. Check your .env.local file exists in project folder
2. Verify the DATABASE_URL is correct:
   - Go to https://neon.tech
   - Log in to your account
   - Copy the connection string again
   - Update .env.local with the correct string
3. Save the file
4. Run `npm run db:push` again

---

### Issue 4: "Module not found" or "Cannot find module"

**What it means:** Dependencies weren't installed properly

**Solution:**
1. Delete `node_modules` folder:
   - Windows: Delete the folder manually
   - Mac: `rm -rf node_modules`
2. Delete `package-lock.json` file
3. Run `npm install` again
4. Wait for completion
5. Run `npm run dev` again

---

### Issue 5: "ERR! 404 while downloading" during npm install

**What it means:** One of the packages isn't available for download

**Solution:**
1. Check your internet connection
2. Try again with: `npm install --force`
3. If still fails, try: `npm cache clean --force` then `npm install`

---

### Issue 6: "ENOENT: no such file or directory"

**What it means:** You're not in the correct project folder

**Solution:**
1. Go back to Step 3
2. Navigate to your project folder in terminal
3. Verify with `dir` (Windows) or `ls` (Mac)
4. You should see: `client`, `server`, `shared` folders

---

### Issue 7: Page shows blank or won't load

**What it means:** The frontend didn't compile correctly

**Solution:**
1. Check the terminal where `npm run dev` is running
2. Look for red error messages
3. Check the browser console (F12)
4. Try refreshing the page (F5)
5. If still fails, stop and restart with `npm run dev`

---

## Next Steps After Successful Login

### As a Mentor:
1. Create a new roadmap with skills
2. Add mentees to your roadmap
3. Monitor their progress
4. Approve mock interview requests

### As a Mentee:
1. Check your learning roadmap
2. Mark skills as complete
3. Request mock interviews
4. View your earned badges

---

## Quick Reference - Terminal Commands

| What to do | Command |
|-----------|---------|
| Navigate to folder | `cd /path/to/folder` |
| Check Node version | `node --version` |
| Check npm version | `npm --version` |
| Install dependencies | `npm install` |
| Initialize database | `npm run db:push` |
| Start development server | `npm run dev` |
| Stop development server | `Ctrl + C` |
| List files in folder | `ls` (Mac) or `dir` (Windows) |
| Show current folder path | `pwd` (Mac) or `cd` (Windows) |

---

## Need More Help?

If you get stuck:
1. Read the error message carefully
2. Check the Troubleshooting section
3. Review the steps you completed
4. Make sure all files are saved correctly
5. Restart your terminal and try again
