# Resources Directory

This directory contains application resources needed for building distributable packages.

## Required Icons

To build the application, you need to add the following icon files:

### macOS
- `icon.icns` - macOS icon file (512x512 minimum)

### Windows  
- `icon.ico` - Windows icon file (256x256 recommended, multiple sizes)

### Linux
- `icon.png` - PNG icon file (512x512 recommended)

## Icon Generation

You can generate these icons from a single high-resolution PNG (1024x1024) using tools like:
- [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)
- Online converters
- macOS: `iconutil` command
- Windows: Various ICO converters

## Files Included

- `entitlements.mac.plist` - macOS security entitlements for hardened runtime