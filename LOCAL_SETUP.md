# Mentorship Progress Tracker - Detailed Local Setup Guide

This guide will walk you through every single step to get the application running on your computer using Neon (online PostgreSQL database).

---

## QUICK SUMMARY - Critical Setup Order

**To avoid all errors, follow this exact order:**

1. **Steps 1-7**: Download project, extract files, install Node.js, install dependencies, set up Neon database
2. **Step 8**: (Optional) Migrate data from Replit only if you have existing data
3. **Step 9**: Create `.env.local` file with DATABASE_URL
4. **🔴 STEP 10 - CRITICAL**: Create session table in Neon (if you skip this, you get "session does not exist" error)
5. **Step 11**: Just informational - schema already defines all columns, migration handles them
6. **Step 12**: Run database migration (npm run db:push) - this creates ALL tables and adds all columns automatically
7. **Step 13**: Start the development server (Windows: `node load-env-and-run-dev.js`, Mac: `npm run dev`)
8. **Steps 14-17**: Open browser, login, test app

**Windows Users**: You MUST use `node load-env-and-run-dev.js` instead of `npm run dev` because PowerShell doesn't support `NODE_ENV=value` syntax.

---

## PRE-FLIGHT CHECKLIST

Before you start, make sure you have:
- [ ] Computer with internet connection
- [ ] Web browser (Chrome, Firefox, Safari, or Edge)
- [ ] Administrator access to your computer
- [ ] About 30 minutes of time
- [ ] The Replit project link handy

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
   - A dropdown menu will appear

3. **Select "Download as zip"**
   - In the menu that appeared, look for "Download as zip" or "Export as zip"
   - Click on it
   - Your browser will start downloading a file

4. **Wait for download to complete**
   - Look at your browser's download bar (usually bottom of screen)
   - The file will be named something like `replit-project.zip`
   - Wait until it shows "Download complete" or 100%
   - Do NOT close the browser until download finishes

5. **Verify the download**
   - Check your Downloads folder to confirm the zip file is there

---

## STEP 2: Extract the Downloaded File

### What you need:
- The downloaded zip file
- Windows Explorer (Windows) or Finder (Mac)

### For Windows Users:

1. **Find the downloaded file**
   - Open File Explorer (press Windows key + E)
   - Click on "Downloads" in the left sidebar
   - Look for a file with .zip extension (like `replit-project.zip`)
   - Right-click on the file

2. **Extract the file**
   - A context menu will appear
   - Click on "Extract All..."
   - A dialog box will open

3. **Choose extraction location**
   - You'll see a text field with a folder path
   - Example: `C:\Users\YourName\Downloads\`
   - You can keep it in Downloads or click "Browse" to choose a better location
   - Suggested location: `C:\Users\YourName\Documents\mentorship-tracker`
   - Click "Select Folder"

4. **Start extraction**
   - In the dialog, click the "Extract" button
   - You'll see a progress bar
   - Wait for extraction to complete (usually 10-30 seconds)

5. **Verify extraction**
   - After extraction, open the new folder
   - You should see folders: `client`, `server`, `shared`, `node_modules` (if exists)
   - You should see files: `package.json`, `.gitignore`, `tsconfig.json`, etc.

### For Mac Users:

1. **Find the downloaded file**
   - Open Finder
   - Click on "Downloads" in the sidebar
   - Look for `replit-project.zip`

2. **Extract the file**
   - Double-click the zip file
   - The file will automatically extract
   - A folder named `replit-project` will appear

3. **Move the folder** (optional)
   - You can move this folder to a better location
   - Drag it to your Documents folder or Desktop
   - Or keep it in Downloads

4. **Verify extraction**
   - Open the extracted folder
   - You should see: `client`, `server`, `shared` folders
   - You should see: `package.json` and other files

---

## STEP 3: Open Command Prompt or Terminal in Project Folder

### For Windows Users:

1. **Open File Explorer**
   - Press Windows key + E

2. **Navigate to your project folder**
   - Click on your extracted project folder
   - Double-click to open it
   - You should be inside the folder with `client`, `server`, `shared` folders visible

3. **Open Command Prompt here**
   - Look at the address bar at the TOP of File Explorer
   - It shows the folder path (like: C:\Users\YourName\Documents\mentorship-tracker)
   - Click on the address bar
   - Type: `cmd`
   - Press Enter
   - A Command Prompt window will open with the folder path shown

4. **Verify you're in the right folder**
   - You should see your folder path in the command prompt
   - Type: `dir`
   - Press Enter
   - You should see output listing:
     - `<DIR> client`
     - `<DIR> server`
     - `<DIR> shared`
     - (and other files)

### For Mac Users:

1. **Open Terminal**
   - Press Command + Space (opens Spotlight search)
   - Type: `terminal`
   - Press Enter
   - Terminal window will open

2. **Navigate to your project folder**
   - Type this command (replace with your path):
     ```
     cd ~/Documents/mentorship-tracker
     ```
   - Or if your folder has a different name:
     ```
     cd ~/Downloads/replit-project
     ```
   - Press Enter

3. **Verify you're in the right folder**
   - Type: `ls`
   - Press Enter
   - You should see output showing:
     - `client/`
     - `server/`
     - `shared/`
     - (and other files)

---

## STEP 4: Verify Node.js is Installed (IMPORTANT)

### What you need:
- Terminal/command prompt (from Step 3)
- Your computer

### Why this is important:
- The application requires Node.js to run
- Without it, nothing will work
- This step prevents "command not found" errors later

### Detailed Instructions:

1. **Check if Node.js is installed**
   - In terminal, type exactly: `node --version`
   - Press Enter

2. **Check the result**
   - **If you see a version number** (like `v18.14.0` or `v20.10.0`):
     - **Great!** Node.js is installed ✓
     - Write down the version number (you might need it later)
     - Skip to Step 5
   
   - **If you see an error** like "command not found" or "node is not recognized as an internal command":
     - Node.js is NOT installed
     - Follow the installation steps below

### How to install Node.js if needed:

1. **Go to Node.js website**
   - Open your web browser
   - Go to https://nodejs.org
   - You'll see two download buttons

2. **Download the LTS version**
   - The LTS (Long Term Support) version is recommended
   - It's usually on the left side of the page
   - The version number should be something like 18.x or 20.x (not odd numbers like 19.x)
   - Click the LTS button
   - Choose your operating system (Windows or Mac will auto-detect)
   - Click "Download"

3. **Install Node.js**
   - Find the downloaded installer file in your Downloads folder
   - Double-click it to run
   - An installer window will appear

4. **Follow the installation wizard**
   - Click "Next" or "Continue" multiple times
   - Accept the license agreement if asked
   - Keep all default settings (don't change anything)
   - Click "Install" or "Finish"
   - Wait for installation to complete

5. **Restart your computer**
   - **This is VERY important** - don't skip this step
   - Restart your computer completely
   - This ensures Node.js is properly added to your system

6. **Verify installation after restart**
   - Open a NEW terminal/command prompt window
   - Type: `node --version`
   - Press Enter
   - You should now see a version number

### Also check npm:

1. **npm comes with Node.js**
   - Type: `npm --version`
   - Press Enter
   - You should see a version number (like `9.8.1`)

2. **If you see an error**
   - Try restarting your computer again
   - If still not working, reinstall Node.js

---

## STEP 5: Clear npm Cache (Prevents Install Errors)

### What you need:
- Terminal/command prompt in your project folder
- Node.js installed from Step 4

### Why this helps:
- Fixes "package not found" errors during installation
- Prevents corrupted cache issues
- Takes only 30 seconds

### Detailed Instructions:

1. **Make sure you're in your project folder**
   - Your terminal should show the project folder path
   - If not, follow Step 3 again

2. **Clear the npm cache**
   - Type: `npm cache clean --force`
   - Press Enter

3. **Wait for completion**
   - You'll see output messages
   - When done, your prompt will appear again
   - It looks like: `npm cache clean --force` is complete when you see `$` or `>` again

4. **What you should see**
   - Some output lines (that's normal)
   - No red error messages
   - Command prompt cursor appears again

---

## STEP 6: Install Project Dependencies

### What you need:
- Terminal/command prompt (from Step 3)
- Node.js installed (from Step 4)
- Cache cleared (from Step 5)

### Why this step:
- Downloads all packages the application needs
- Without this, the app won't run
- Takes 3-5 minutes

### Detailed Instructions:

1. **Verify you're in project folder**
   - Type: `pwd` (Mac) or `cd` (Windows) and press Enter
   - You should see the folder path with "mentorship" or "replit-project" in it

2. **Run npm install**
   - Type exactly: `npm install`
   - Press Enter

3. **What happens during installation**
   - Terminal will show many lines of output
   - You'll see dots/progress bars
   - You might see some warnings (usually harmless - yellow/orange text)
   - **Do NOT stop this process** - let it run to completion

4. **When installation is complete**
   - You'll see a summary line like:
     ```
     added 850 packages in 2m
     ```
   - Your command prompt cursor will appear again
   - You're back to the `$` or `>` prompt

5. **What NOT to see**
   - **Red error messages that say "ERR!"** - This means something failed
   - If you see errors, try running `npm install` again
   - If it fails twice, clear cache with `npm cache clean --force` and try again

6. **Verify installation worked**
   - Type: `ls node_modules` (Mac) or `dir node_modules` (Windows)
   - Press Enter
   - You should see a long list of folder names (hundreds of them)
   - If you see a list, installation was successful ✓

---

## STEP 7: Set Up Your Online Database with Neon

### Why Neon?
- Neon is a cloud PostgreSQL database (like AWS but simpler)
- Works perfectly for this application
- Free tier available (includes free database)
- No need to install anything locally
- Accessible from anywhere

### Part A: Create Neon Account

1. **Open your web browser**
   - Go to https://neon.tech

2. **Click Sign Up**
   - You'll see a "Sign Up" button
   - Click on it
   - Or click "Get Started"

3. **Enter your email**
   - Enter your email address
   - The email you use here is just for account login (not for the app)

4. **Create a password**
   - Create a strong password (mix of letters, numbers, symbols)
   - Write it down somewhere safe
   - You'll need this password next time you log in to Neon

5. **Click Sign Up or Create Account**
   - Neon might send you a verification email
   - Check your email and click the verification link
   - You'll be logged into Neon

6. **Complete profile** (if asked)
   - You can skip most fields
   - Just complete what's required

### Part B: Create a Database Project

1. **In the Neon dashboard**
   - After login, you'll see the main dashboard
   - Look for "Create Project" or "New Project" button
   - Click it

2. **Fill in project details**
   - **Project Name**: Type `mentorship-tracker` (or any name you want)
   - **Database Name**: Leave as `neondb` (default is fine)
   - **Region**: Select the region closest to you (usually auto-selected)
   - **Postgres Version**: Leave as default (latest version)

3. **Click Create Project**
   - Wait for project creation (takes about 30 seconds)
   - You'll see a loading screen
   - Then you'll be taken to the project page

### Part C: Get Your Connection String

1. **Find the Connection String section**
   - On your Neon project page, look for "Connection" or "Database"
   - Click on it

2. **Look for Connection String**
   - You'll see different connection options
   - Look for the one labeled "Connection string" or "PostgreSQL"
   - It will look something like:
     ```
     postgresql://user:password@host:5432/database
     ```
   - Example full string:
     ```
     postgresql://neondb_owner:abc123xyz@ep-xyz.us-east-4.aws.neon.tech:5432/neondb
     ```

3. **Copy the connection string**
   - Click the copy button next to it (clipboard icon)
   - Or select all the text and press Ctrl+C (Windows) or Command+C (Mac)

4. **Save it somewhere safe**
   - Paste it into Notepad or a text editor temporarily
   - You'll need this in the next step
   - **Important**: This string contains your password - keep it private

---

## STEP 8: Migrate Your Data from Replit to Neon (OPTIONAL - if you have existing data)

### When to do this step:
- You have an existing Replit project with data (roadmaps, mentees, progress)
- You want to copy all that data to your local Neon database
- Skip this if you're starting fresh with no data

### Why migrate:
- Keeps your existing roadmaps and mentee data
- Saves time instead of manually recreating everything
- Ensures continuity in your mentorship tracking

### What you need:
- Your Replit project access
- Terminal in your project folder
- PostgreSQL tools installed locally (we'll install if needed)

### Part A: Get Your Replit Database Connection String

1. **Log in to Replit**
   - Go to https://replit.com
   - Open your Mentorship Progress Tracker project

2. **Find the Secrets/Environment section**
   - Look at the left sidebar
   - Find "Secrets" icon (looks like a lock) or "Environment" section
   - Click on it

3. **Find DATABASE_URL**
   - You'll see a list of environment variables/secrets
   - Look for one named `DATABASE_URL`
   - It will look like:
     ```
     postgresql://xxx:xxx@ep-xyz.neon.tech:5432/neondb
     ```

4. **Copy the entire connection string**
   - Click the copy button next to DATABASE_URL
   - Or select all and copy with Ctrl+C / Command+C
   - Save it in a text editor for now
   - Label it: "REPLIT_DATABASE_URL"

### Part B: Install PostgreSQL Tools (if you don't have them)

These tools allow you to backup and restore databases.

**For Windows:**

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Download the latest version

2. **Run the installer**
   - Double-click the downloaded file
   - Click "Next" when asked
   - For "Installation Directory", keep default
   - For "Components", make sure these are checked:
     - PostgreSQL Server
     - pgAdmin 4
     - Command Line Tools ✓
   - For Password, create a password (write it down, though you won't need it)
   - Click "Next" and "Finish"

3. **Verify installation**
   - Open Command Prompt
   - Type: `pg_dump --version`
   - Press Enter
   - You should see version number (like "pg_dump (PostgreSQL) 15.x")

**For Mac:**

1. **Install using Homebrew**
   - Open Terminal
   - Type: `brew install postgresql@15`
   - Press Enter
   - Wait for installation

2. **Verify installation**
   - Type: `pg_dump --version`
   - Press Enter
   - You should see version number

### Part C: Export Data from Replit Database

1. **Open Command Prompt/Terminal in your project folder**
   - Make sure you're in your project folder
   - Same location as package.json

2. **Export the database**
   - Type this command (on ONE line):
     ```
     pg_dump "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" > replit_backup.sql
     ```
   - Replace the connection string with your REPLIT_DATABASE_URL from Part A
   - Example:
     ```
     pg_dump "postgresql://user:mypassword@ep-abc123.neon.tech:5432/neondb" > replit_backup.sql
     ```
   - Press Enter

3. **What happens**
   - It will take 10-30 seconds
   - A file named `replit_backup.sql` will be created in your project folder
   - This file contains all your data (schemas, tables, data)

4. **Verify the backup**
   - Type: `dir replit_backup.sql` (Windows) or `ls replit_backup.sql` (Mac)
   - Press Enter
   - You should see the file listed
   - File size should be more than 1 KB

### Part D: Import Data into Your Neon Database

1. **Import the backup into Neon**
   - In the same terminal, type this command (on ONE line):
     ```
     psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" < replit_backup.sql
     ```
   - Replace the connection string with your NEON connection string from Step 7
   - Example:
     ```
     psql "postgresql://neondb_owner:mypassword@ep-xyz.us-east-4.aws.neon.tech:5432/neondb" < replit_backup.sql
     ```
   - Press Enter

2. **What happens**
   - It will show many SQL commands being executed
   - This creates all tables and imports your data
   - Takes 10-60 seconds depending on data size
   - When done, your prompt will appear again

3. **Common issues during import**
   - **"Error: relation already exists"**: This happens if tables were already created
     - Solution: Continue anyway, data will be imported correctly
   
   - **"Error: permission denied"**: Connection string might be wrong
     - Solution: Double-check your Neon connection string
   
   - **"psql: command not found"**: PostgreSQL tools aren't installed
     - Solution: Go back to Part B and install PostgreSQL

### Part E: Add Missing Columns for Individual Skills

After migrating data from Replit to Neon, you need to add columns that support individual (custom) skills:

1. **Go to your Neon Database SQL Editor**
   - Log in to https://console.neon.tech
   - Select your project
   - Open the SQL editor

2. **Run these SQL commands:**
   ```sql
   ALTER TABLE badges ADD COLUMN IF NOT EXISTS individual_skill_id varchar;
   ALTER TABLE mock_interview_requests ADD COLUMN IF NOT EXISTS individual_skill_id varchar;
   ```

3. **Execute the queries**
   - These columns support custom skills that mentees can add to their roadmaps

### Part F: Verify Data Migration

1. **Start the development app**
   - For Windows: `node load-env-and-run-dev.js`
   - For Mac/Linux: `npm run dev`
   - App should start without session table errors

2. **Verify data in browser**
   - Open http://localhost:5000 (or the URL shown in terminal)
   - Login to your account
   - Check if your roadmaps are there
   - Check if your mentees are there
   - Check if your progress data is intact
   - Go to Students page - should show all student details without errors

### Part F: Clean Up

1. **Delete the backup file** (optional)
   - You can keep `replit_backup.sql` for safety
   - Or delete it to save space:
     - Type: `del replit_backup.sql` (Windows) or `rm replit_backup.sql` (Mac)

---

## STEP 9: Create the .env.local Configuration File

### What you need:
- Your connection string from Step 7
- A text editor (Notepad, VS Code, TextEdit)
- Your project folder

### Why this step:
- This tells the application how to connect to your database
- Without this file, the app can't access the database

### Detailed Instructions:

1. **Open a text editor**
   - **Windows**: 
     - Right-click in your project folder
     - Select "New" → "Text Document"
     - A file named "New Text Document.txt" will appear
   
   - **Mac**: 
     - Open TextEdit from Applications → Utilities
     - Press Command + Shift + T to use plain text mode

2. **Create the file content**
   - In your text editor, type this exact text:
     ```
     DATABASE_URL=postgresql://neondb_owner:abc123xyz@ep-xyz.us-east-4.aws.neon.tech:5432/neondb
     ```
   - **But replace the connection string** with your actual string from Step 7

3. **How to replace it**
   - Delete everything after `DATABASE_URL=`
   - Paste your connection string from Neon
   - The line should start with `DATABASE_URL=` and end with your database name
   - Example:
     ```
     DATABASE_URL=postgresql://neondb_owner:YourPasswordHere@ep-abc123.us-east-4.aws.neon.tech:5432/neondb
     ```

4. **Save the file with correct name**
   - **Windows**: 
     - Click "File" → "Save As"
     - In the filename field, type: `.env.local` (with the dot)
     - In "Save as type", select "All Files (*.*)" not "Text Documents"
     - Save location: Inside your project folder (same level as package.json)
     - Click "Save"
   
   - **Mac**: 
     - Press Command + S
     - For filename, type: `.env.local`
     - For location, navigate to your project folder
     - Click "Save"

5. **Verify the file exists**
   - Go back to File Explorer/Finder
   - Navigate to your project folder
   - Look for `.env.local` file
   - **Windows**: It might appear as a file without extension - that's okay
   - **Mac**: Check if you can see hidden files (files starting with dot)
     - If you can't see it, press Command + Shift + . to show hidden files

6. **Important notes about this file**
   - The filename MUST be `.env.local` (with the dot at the beginning)
   - If it's named something else (like `env.local` or `.env.local.txt`), it won't work
   - Keep this file private - it contains your database password
   - Never commit it to git or share it

---

## STEP 10: Create Session Table in Neon (CRITICAL - Do This First!)

### ⚠️ IMPORTANT: This step MUST be done BEFORE starting the app

The session table is required for user login and session management. If you skip this, you'll get "relation session does not exist" error.

### What you need:
- Access to your Neon database
- Your Neon project created from Step 7

### Detailed Instructions:

1. **Go to your Neon SQL Editor**
   - Log in to https://console.neon.tech
   - Select your project
   - Click on the "SQL Editor" or "Query Editor" tab

2. **Copy and paste this SQL code:**
   ```sql
   CREATE TABLE IF NOT EXISTS "session" (
     "sid" varchar PRIMARY KEY,
     "sess" json NOT NULL,
     "expire" timestamp(6) NOT NULL
   );
   
   CREATE INDEX IF NOT EXISTS "IDX_session_expire" on "session" ("expire");
   ```

3. **Execute the query**
   - Click "Run" or press the execute button
   - You should see: `CREATE TABLE` and `CREATE INDEX` in the output
   - This confirms the session table was created ✓

---

## STEP 11: Database Migration Will Handle Missing Columns Automatically

### How it works:
- Your Drizzle schema already defines `individualSkillId` columns in both `badges` and `mock_interview_requests` tables
- When you run `npm run db:push` in Step 12, it compares your schema with the database
- If columns are missing, `drizzle-kit` automatically adds them

### If you migrated from Replit:
- If the columns still don't exist after Step 12, run this in your Neon SQL Editor:
  ```sql
  ALTER TABLE badges ADD COLUMN IF NOT EXISTS individual_skill_id varchar;
  ALTER TABLE mock_interview_requests ADD COLUMN IF NOT EXISTS individual_skill_id varchar;
  ```
- But this should rarely be needed - `npm run db:push` usually handles it

### Why you might need manual ALTER:
- Only if `pg_dump` from Replit captured the OLD schema before columns were added
- And `drizzle-kit` doesn't detect them during migration
- Most of the time, Step 12 takes care of everything ✓

---

## STEP 12: Test Database Connection

### What you need:
- `.env.local` file from Step 9
- Terminal in your project folder
- Node.js installed

### ⚠️ IMPORTANT: The session table MUST exist before this step

### Detailed Instructions:

**For Windows Users:**

1. **Make sure you're in your project folder**
   - Terminal should show your project path

2. **Run database migration with environment loading**
   - Type: `node load-env-and-push.js`
   - Press Enter

3. **What should happen**
   - Terminal will connect to your Neon database
   - It will create all necessary application tables
   - You should see messages like:
     ```
     ✓ DATABASE_URL loaded successfully
     Running drizzle-kit push...
     [✓] Changes applied
     ```

**For Mac/Linux Users:**

1. **Make sure you're in your project folder**

2. **Run database migration**
   - Type: `npm run db:push`
   - Press Enter

3. **What should happen**
   - Terminal will create all necessary tables
   - Should complete without errors

### ⚠️ If you see: "relation session does not exist"

**This means you skipped Step 10.** Go back and create the session table in Neon first, then try again.

### If successful
- Your database is now set up ✓
- All tables are created
- You can proceed to Step 11

### If you see an error
- **"Error: Unauthorized" or "ECONNREFUSED"**: Connection string is wrong
  - Go back to Neon
  - Copy the connection string again carefully
  - Update `.env.local` file
  - Try again

- **"Error: relation does not exist"**: Database was partially created
  - This is okay - run the command again

- **"error: password authentication failed"**: Password in connection string is wrong
  - Go to Neon → Settings
  - Reset the database password
  - Get new connection string
  - Update `.env.local`

---

## STEP 13: Start the Development Server

### What you need:
- Terminal in project folder
- All previous steps completed successfully (Steps 1-12)
- Database and session table created

### ⚠️ CRITICAL: If you skipped Steps 10 or 12, the app will crash with session errors

### Why this step:
- This starts the backend and frontend servers
- Makes the app accessible at localhost:5000

### Detailed Instructions:

**For Windows Users:**

1. **Make sure you're in the project folder**
   - Terminal should show your project path (where package.json is)
   - If not, repeat Step 3

2. **Start the development server with environment loading**
   - Type exactly: `node load-env-and-run-dev.js`
   - Press Enter
   - Wait 15-20 seconds for startup

3. **What you should see**
   - ✓ Environment loaded
   - Starting development server...
   - Then after a few seconds:
     ```
     [express] serving on port 5000
     ```

**For Mac/Linux Users:**

1. **Make sure you're in the project folder**

2. **Start the development server**
   - Type exactly: `npm run dev`
   - Press Enter
   - Wait 15-20 seconds for startup

3. **What you should see**
   - After a few seconds:
     ```
     [express] serving on port 5000
     ```

### Success Indicators ✓
- Server is running on port 5000
- No red "ERROR" messages in terminal
- No "relation session does not exist" errors
- Terminal shows the startup messages

### What to do if it crashes

**If you see: "relation session does not exist"**
- Go back to Step 10 and create the session table in Neon
- Stop the server (Ctrl+C)
- Try starting again

**If you see: "Cannot find module" errors**
- You didn't run `npm install` in Step 6
- Go back and run: `npm install`
- Then try starting the server again

**If you see: "port 5000 is already in use"**
- Another app is using port 5000
- Either close that app, or see Troubleshooting section

### Keep this terminal window open
- **DO NOT close this window** while using the app
- Your server needs to keep running
- You can minimize it but don't close it
- To close later: Press Ctrl+C

---

## STEP 14: Open the Application in Your Browser

### What you need:
- A web browser (Chrome, Firefox, Safari, Edge)
- The server running from Step 11 (don't close that terminal)

### Detailed Instructions:

1. **Open your web browser**
   - Click the browser icon on your desktop/taskbar
   - Or press Ctrl+Space and search for your browser

2. **Type the local address**
   - Click on the address bar at the top (where URLs go)
   - Type exactly: `http://localhost:5000`
   - Press Enter

3. **Wait for the page to load**
   - It will take 2-5 seconds
   - You should see the Mentorship Progress Tracker login page
   - The page will show:
     - A title like "Mentorship Progress Tracker"
     - An email input field
     - A password input field
     - A "Login" button

4. **If the page doesn't load**
   - Check your terminal window (from Step 11)
   - Verify it shows `[express] serving on port 5000`
   - Wait 10 seconds and refresh the browser (press F5)
   - Check your internet connection
   - If still not working, see Troubleshooting section

5. **You're ready to create an account!**
   - The app is now running ✓

---

## STEP 15: Create Your Account and Login

### What you need:
- The application loaded in browser from Step 11
- An email address (any email)
- A strong password (at least 8 characters)

### Detailed Instructions:

1. **Find the Sign Up option**
   - On the login page, look for:
     - "Don't have an account?" text
     - "Create Account" link
     - "Sign Up" button
   - Click on it to go to sign-up page

2. **Fill in the sign-up form**
   - **Email field**: 
     - Type your email address (example: yourname@gmail.com)
     - This email will be your login credentials
   
   - **Password field**: 
     - Create a strong password (8+ characters)
     - Use mix of: letters, numbers, symbols
     - Example: `SecurePass123!`
   
   - **Confirm Password**: 
     - Type the same password again
   
   - **User Type**: 
     - Choose ONE:
       - **"Mentor"** - if you're creating roadmaps and managing students
       - **"Mentee"** - if you're learning through a roadmap

3. **Click Sign Up button**
   - After filling all fields, click the "Sign Up" button
   - The page will process your request

4. **What happens after sign up**
   - You'll be redirected to your dashboard
   - You'll see different interface based on your role:
     - **Mentors**: See dashboard with roadmaps and students
     - **Mentees**: See your learning journey and skills
   - You're now logged in ✓

5. **Keep your credentials safe**
   - Write down your email and password somewhere safe
   - You'll need them to log in again later

---

## STEP 16: Test the Application

### What you need:
- Logged-in application
- Browser with developer console open

### Detailed Instructions:

1. **Test page loading**
   - Navigate to different pages in the app
   - Check that pages load without errors
   - Click buttons to verify they work

2. **Open browser console** (optional - for debugging)
   - Press F12 on your keyboard
   - Look at the "Console" tab
   - Check for red error messages
   - If you see errors, note them down

3. **Verify database connection**
   - In your application, perform an action:
     - Create something new
     - Edit something
     - Mark something complete
   - If it works, database connection is good ✓

4. **If you see errors**
   - Check the browser console (F12)
   - Check the terminal window where server is running
   - Note any error messages
   - Refer to troubleshooting section below

---

## STEP 17: Stop the Application

### When you want to stop using the app:

1. **Save your work**
   - Make sure any changes are saved in the app

2. **Close browser tab**
   - Just close the browser tab or window with the app
   - No data will be lost

3. **Stop the server** (optional but recommended)
   - Click on the terminal window where `npm run dev` is running
   - Press Ctrl + C on your keyboard
   - You'll see `^C` in the terminal
   - The server will stop

4. **Verify it stopped**
   - After pressing Ctrl+C, your prompt will appear again
   - Terminal is now ready for new commands
   - You can close the terminal window now

5. **Your data remains safe**
   - Everything is saved in Neon database
   - You can start the app again anytime with `npm run dev`

---

## TROUBLESHOOTING GUIDE

### ERROR 1: "npm: command not found"

**When you see it**: During Step 5 or later

**What it means**: Node.js is not installed or not in your system PATH

**Solution**:
1. Go to Step 4 again to install Node.js
2. Make sure you restart your computer after installation
3. Open a NEW terminal window after restart
4. Try again

---

### ERROR 2: "Port 5000 is already in use"

**When you see it**: When running `npm run dev` in Step 10

**What it means**: Another application is already using port 5000

**Solution Option A - Find and close the other app**:
1. Close other applications that might use port 5000
2. Check if another terminal window has a dev server running
3. Stop that server first
4. Try `npm run dev` again

**Solution Option B - Use a different port**:
1. Stop `npm run dev` (press Ctrl+C)
2. Type: `PORT=5001 npm run dev`
3. Then go to: `http://localhost:5001`

**Solution Option C - Windows specific**:
1. Find what's using port 5000:
   - Type: `netstat -ano | findstr :5000`
   - Note the PID number shown
2. Kill the process:
   - Type: `taskkill /PID [number] /F`
   - Replace [number] with the PID from above
3. Try `npm run dev` again

---

### ERROR 3: "DATABASE_URL is not set" or "cannot connect to database"

**When you see it**: During Step 9 or Step 10

**What it means**: `.env.local` file is missing, misnamed, or database URL is wrong

**Solution**:
1. Verify `.env.local` file exists in project folder
   - Check filename is exactly `.env.local` (with dot)
   - Not `env.local` or `.env.local.txt`
   - If missing, create it (repeat Step 8)

2. Verify content is correct
   - Open `.env.local` in text editor
   - First line should be: `DATABASE_URL=postgresql://...`
   - Make sure connection string is complete (no line breaks)

3. Check connection string
   - Go to Neon.tech
   - Log in to your project
   - Copy the connection string again
   - Paste it into `.env.local`

4. Try again
   - Save `.env.local`
   - Run `npm run db:push` to test
   - Then run `npm run dev`

---

### ERROR 4: "error: relation "session" does not exist"

**When you see it**: In terminal when trying to login

**What it means**: Database tables weren't created properly

**Solution**:
1. Run database setup:
   - Stop server (press Ctrl+C)
   - Type: `npm run db:push`
   - Wait for completion
   - Then run `npm run dev` again

2. If error continues:
   - This might be a temporary issue
   - Stop server (Ctrl+C)
   - Wait 5 seconds
   - Run `npm run dev` again

---

### ERROR 5: "Module not found" or "Cannot find module"

**When you see it**: During Step 10 startup or browser console

**What it means**: Dependencies weren't installed properly

**Solution**:
1. Stop server (press Ctrl+C)
2. Delete dependencies:
   - Type: `rm -rf node_modules` (Mac) or delete `node_modules` folder manually (Windows)
   - Also delete `package-lock.json` file
3. Reinstall:
   - Type: `npm cache clean --force`
   - Type: `npm install`
   - Wait for completion
4. Try again:
   - Type: `npm run dev`

---

### ERROR 6: "Cannot read properties of undefined"

**When you see it**: Browser console or app stops working

**What it means**: Frontend tried to use data that doesn't exist yet

**Solution**:
1. Refresh the browser (F5)
2. Wait 5 seconds
3. Try the action again
4. If it keeps happening:
   - Stop server (Ctrl+C)
   - Run `npm run dev` again
   - Refresh browser

---

### ERROR 7: "ENOENT: no such file or directory"

**When you see it**: During `npm install` or other npm commands

**What it means**: You're not in the correct project folder

**Solution**:
1. Verify you're in project folder
   - Type: `pwd` (Mac) or `cd` (Windows)
   - Press Enter
   - Should show path with "mentorship" or "replit-project"

2. Navigate to correct folder
   - Repeat Step 3 to navigate to project folder

3. Try the command again

---

### ERROR 8: "ERR! 404 Not Found" during `npm install`

**When you see it**: During Step 6 npm install

**What it means**: A package couldn't be downloaded from npm

**Solution**:
1. Check internet connection
   - Make sure you're connected to internet
   - Try opening a website in browser

2. Try again:
   - Type: `npm install`
   - Press Enter

3. If still fails:
   - Type: `npm cache clean --force`
   - Type: `npm install --force`
   - Wait for completion

---

### ERROR 9: Page shows blank or "Cannot GET /"

**When you see it**: When opening localhost:5000

**What it means**: Frontend didn't compile or server isn't running properly

**Solution**:
1. Check terminal window
   - Look at terminal where `npm run dev` is running
   - Should show `[express] serving on port 5000`
   - Look for red error messages

2. Refresh browser
   - Press F5 in browser
   - Wait 5 seconds

3. If still blank:
   - Stop server (Ctrl+C)
   - Check terminal for errors
   - Type: `npm run dev` again
   - Wait 20 seconds for full startup
   - Refresh browser (F5)

---

### ERROR 10: Login page appears but login doesn't work

**When you see it**: After filling email/password and clicking login

**What it means**: Database connection issue or authentication problem

**Solution**:
1. Check browser console
   - Press F12
   - Look at Console tab
   - Note any error messages

2. Verify database is set up
   - Stop server (Ctrl+C)
   - For Windows: `node load-env-and-push.js`
   - For Mac/Linux: `npm run db:push`
   - Should see success message
   - Start server again

3. Try creating new account
   - Click "Sign Up"
   - Fill in new email and password
   - Choose a role
   - Click "Sign Up"

4. If still doesn't work:
   - Check `.env.local` file
   - Verify DATABASE_URL is correct
   - Stop server and start again

---

### ERROR 11: "NODE_ENV is not recognized as an internal or external command" (Windows)

**When you see it**: When trying to run `npm run dev` on Windows

**What it means**: PowerShell on Windows doesn't support Unix-style environment variable syntax

**Solution**:
1. **Use the provided script instead**
   - Stop any running server (Ctrl+C)
   - Type: `node load-env-and-run-dev.js`
   - Press Enter
   - This script loads the environment properly on Windows

2. **Why this happens**:
   - Windows PowerShell uses different syntax than Mac/Linux
   - `NODE_ENV=development` works on Mac/Linux but not Windows
   - The script handles this automatically for you

3. **If script doesn't exist**:
   - Verify `load-env-and-run-dev.js` is in your project folder
   - Compare with Mac/Linux users
   - Ask them to send you the script file

---

### ERROR 12: Database migration - "drizzle-kit is not recognized" (Windows)

**When you see it**: When running `npm run db:push` on Windows

**What it means**: PowerShell can't find drizzle-kit command

**Solution**:
1. **Use the provided script instead**
   - Type: `node load-env-and-push.js`
   - Press Enter
   - This handles environment setup for Windows

2. **If script doesn't exist**:
   - Verify `load-env-and-push.js` is in your project folder
   - Make sure it's in the same location as `package.json`
   - Re-download project if missing

---

## QUICK REFERENCE - Terminal Commands

### Universal Commands (Windows, Mac, Linux)

| What to do | Command |
|-----------|---------|
| Check Node version | `node --version` |
| Check npm version | `npm --version` |
| Clear npm cache | `npm cache clean --force` |
| Install dependencies | `npm install` |
| Stop development server | `Ctrl + C` |
| Navigate to folder | `cd /path/to/folder` |
| List files | `ls` (Mac) or `dir` (Windows) |
| Show current folder | `pwd` (Mac) or `cd` (Windows) |

### Mac/Linux Commands

| What to do | Command |
|-----------|---------|
| Test database connection | `npm run db:push` |
| Start development server | `npm run dev` |

### Windows Commands (PowerShell)

| What to do | Command |
|-----------|---------|
| Test database connection | `node load-env-and-push.js` |
| Start development server | `node load-env-and-run-dev.js` |

**Note:** Windows PowerShell doesn't support Unix-style environment variables (like `NODE_ENV=value`), so use the provided `.js` scripts instead.

---

## SUCCESS CHECKLIST - Follow This Order

Complete these items in order to avoid errors:

### Pre-Setup (Steps 1-9)
- [ ] Node.js installed (`node --version` shows version)
- [ ] npm working (`npm --version` shows version)
- [ ] Project downloaded and extracted
- [ ] Dependencies installed (`npm install` completed)
- [ ] Neon account created with database project
- [ ] `.env.local` file created in project folder
- [ ] DATABASE_URL is correct in `.env.local`

### 🔴 CRITICAL - Session Table (Step 10)
- [ ] Logged into https://console.neon.tech
- [ ] Session table created in Neon database using SQL:
  ```sql
  CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar PRIMARY KEY,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
  );
  CREATE INDEX IF NOT EXISTS "IDX_session_expire" on "session" ("expire");
  ```
- [ ] SQL commands executed successfully in Neon

### Optional - Data Migration (Step 8)
- [ ] (Optional) Data migrated from Replit to Neon using pg_dump and psql

### Database Setup (Step 12)
- [ ] Database migration completed:
  - Windows: `node load-env-and-push.js` succeeded
  - Mac/Linux: `npm run db:push` succeeded
- [ ] No "relation session does not exist" errors

### Development Server (Step 13)
- [ ] Server started successfully:
  - Windows: `node load-env-and-run-dev.js`
  - Mac/Linux: `npm run dev`
- [ ] Terminal shows `[express] serving on port 5000`
- [ ] No red ERROR messages in terminal

### Application (Steps 14-15)
- [ ] Browser opens localhost:5000
- [ ] Login page appears
- [ ] Can create new account (sign up)
- [ ] Can login with credentials
- [ ] Can see mentor/mentee dashboard

**If ALL items are checked ✓, you're ready to use the app!**

---

## If You Encounter Errors

### "relation session does not exist" Error
- You skipped Step 10
- Solution: Go back and create the session table in Neon following Step 10 exactly
- Then stop server and try again

### "NODE_ENV is not recognized" Error (Windows)
- You used `npm run dev` instead of the correct script
- Solution: Use `node load-env-and-run-dev.js` instead

### "Cannot find module" Errors
- You skipped `npm install` in Step 6
- Solution: Run `npm install` and wait for completion, then try again

### Database connection errors
- Database URL is wrong or `.env.local` doesn't exist
- Solution: Go back to Step 9 and verify `.env.local` has the correct DATABASE_URL

---

## NEXT STEPS AFTER SETUP

### As a Mentor:
1. Create your first roadmap with skills
2. Create a mentee account
3. Assign your roadmap to the mentee
4. Add mock interview gates to skills
5. Monitor mentee progress from dashboard

### As a Mentee:
1. View your assigned learning roadmap
2. Complete roadmap items in sequence
3. Request mock interviews when ready
4. View earned badges after approval
5. Track your overall progress percentage

---

## Still Having Issues?

If you're still stuck:

1. **Read error message carefully**
   - Most error messages tell you exactly what's wrong
   - Search for the error in this guide

2. **Check each step was completed**
   - Go back and verify each step
   - Common skipped steps: Node.js installation, database setup

3. **Check terminal and console**
   - Open browser console (F12)
   - Check terminal where server runs
   - Both show helpful error information

4. **Try a fresh start**
   - Stop the server (Ctrl+C)
   - Wait 10 seconds
   - Run `npm run dev` again
   - Often fixes temporary issues

5. **Verify connections**
   - Test Neon database connection: `npm run db:push`
   - Check internet connection is active
   - Make sure firewall isn't blocking connections

---

## Need Help With Specific Features?

After setup is complete, refer to:

- **Creating roadmaps**: Mentor dashboard has "Add Skill" button
- **Adding mentees**: Click "Invite Mentee" in mentor area
- **Tracking progress**: Check mentee details in "All Students"
- **Approving work**: Go to "Mock Interview Requests"
- **Viewing badges**: Mentee can see in "My Badges" page
- **Payments**: "Payment Portfolio" section in mentor area

---

Good luck with your setup! The application is now ready to use.
