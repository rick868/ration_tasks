# Ration

Ration is a local-first productivity workspace.

Workspace pages, blocks, databases, settings, and attachments are stored on the
current device in a local IndexedDB database. In the Electron app, Chromium
keeps that database in Electron's per-user application data directory, so data
does not require an account or network connection. Uninstalling the application
may remove that directory, so export or back up your workspace before removal.

## Run in development

npm install
npm run dev

## Build the web app

npm run build

## Build Linux release artifacts

npm install
npm run dist

This creates all Linux release artifacts in the release folder, including:

- Debian package: release/Ration_1.0.1-linux-amd64.deb
- AppImage: release/Ration_1.0.1-linux-x86_64.AppImage
- Portable tar.gz: release/Ration_1.0.1-linux-x86_64.tar.gz

Install the Debian package on Debian or Ubuntu with:

sudo dpkg -i release/Ration_1.0.1-linux-amd64.deb

If dependency errors occur, fix them with:

sudo apt-get install -f

The package is built for 64-bit Linux and installs on supported Debian and
Ubuntu releases with their normal Electron runtime libraries. The application
uses the local user's data directory and does not require a server.


The workflow is defined in .github/workflows/release.yml and uploads the generated .deb, .AppImage, and .tar.gz files as release assets.
