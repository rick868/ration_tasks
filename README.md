# Ration

Ration is a local-first productivity workspace.

## Run in development

npm install
npm run dev

## Build the web app

npm run build

## Build a Debian package

npm install
npm run dist

This creates a Debian package in the release folder, for example:

release/Ration_1.0.0_amd64.deb

Install it on Debian with:

sudo dpkg -i release/Ration_1.0.0_amd64.deb

If dependency errors occur, fix them with:

sudo apt-get install -f
