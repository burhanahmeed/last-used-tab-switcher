# Last Used Tab Switcher - Chrome Extension

A Chrome extension that allows you to quickly switch between your current tab and the last used tab, plus duplicate the current tab, similar to Firefox's behavior.

## Features

- **Tab Switching**: Quickly switch between current and last used tab
- **Tab Duplication**: Duplicate the current tab with a keyboard shortcut
- **Keyboard Shortcuts**: 
  - `Alt+Tab` (Mac) / `Ctrl+Q` (Windows/Linux) to switch to last used tab
  - `Alt+Shift+D` (Mac) / `Ctrl+Shift+D` (Windows/Linux) to duplicate current tab
- **Popup Interface**: Click the extension icon to access both features manually
- **Automatic Tracking**: Automatically tracks your tab usage in the background

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this folder
4. The extension will be installed and ready to use

## Usage

### Keyboard Shortcuts

**Switch to Last Used Tab:**
- `Alt+Tab` on Mac
- `Ctrl+Q` on Windows/Linux

**Duplicate Current Tab:**
- `Alt+Shift+D` on Mac  
- `Ctrl+Shift+D` on Windows/Linux

All shortcuts can be customized in Chrome's extension settings at `chrome://extensions/shortcuts`

### Popup Interface
- Click the extension icon in the toolbar
- View current and last used tab information
- Click "Switch to Last Used Tab" button to switch tabs
- Click "Duplicate Current Tab" button to duplicate the current tab

## How It Works

The extension tracks tab activation events and maintains a record of:
- Current active tab
- Last used tab (the tab you were on before the current one)

**Tab Switching:** When you use the switch shortcut or button, it activates the last used tab, making tab switching quick and efficient.

**Tab Duplication:** When you use the duplicate shortcut or button, it creates a new tab with the same URL as the current tab and places it immediately after the current tab.

## Files Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker that tracks tab usage
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `icon*.png` - Extension icons (16x16, 48x48, 128x128 PNG files)
- `requirements.txt` - Python dependencies for icon generation
- `LICENSE` - MIT License
- `create_simple_icons.py` - Script to generate icons

## Customization

You can customize the keyboard shortcut by:
1. Going to `chrome://extensions/shortcuts`
2. Finding "Last Used Tab Switcher"
3. Setting your preferred key combination

## Notes

- The extension requires "tabs" permission to track and switch between tabs
- Tab tracking starts when the extension is installed/enabled
- If the last used tab is closed, the extension will handle this gracefully
