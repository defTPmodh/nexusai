# Install Git for Windows

## Quick Install Guide

1. **Download Git**
   - Go to: https://git-scm.com/download/win
   - Click "Download for Windows"
   - The download will start automatically

2. **Run Installer**
   - Open the downloaded `.exe` file
   - Click "Next" through the installer
   - **Important**: Keep default settings (they're perfect for our use)
   - Click "Install"
   - Wait for installation to complete

3. **Restart PowerShell**
   - Close your current PowerShell window
   - Open a new PowerShell window
   - Navigate back to project: `cd c:\Users\tpmod\Downloads\nexusai`

4. **Verify Installation**
   ```powershell
   git --version
   ```
   Should show something like: `git version 2.x.x`

5. **Configure Git (One-time setup)**
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

6. **Now you can follow DEPLOY_COMMANDS.md**

## After Installing Git

Run these commands:
```powershell
cd c:\Users\tpmod\Downloads\nexusai
git init
git add .
git commit -m "Initial commit - Ready for Vercel"
```

Then create a GitHub repository and push!

