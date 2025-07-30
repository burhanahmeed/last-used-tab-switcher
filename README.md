# Last Used Tab Switcher - Chrome Extension

A Chrome extension that allows you to quickly switch between your current tab and the last used tab, similar to Firefox's behavior.

## Features

- **Keyboard Shortcut**: Use `Ctrl+Shift+Tab` (or `Cmd+Shift+Tab` on Mac) to switch to the last used tab
- **Popup Interface**: Click the extension icon to see tab information and switch manually
- **Automatic Tracking**: Automatically tracks your tab usage in the background

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this folder
4. The extension will be installed and ready to use

## Usage

### Keyboard Shortcut
- Press `Ctrl+Q` on all platforms (Windows/Linux/Mac) to switch to your last used tab
- Using `Ctrl+Q` on Mac avoids conflicts with `Cmd+Q` (which quits applications)
- The shortcut can be customized in Chrome's extension settings at `chrome://extensions/shortcuts`

### Popup Interface
- Click the extension icon in the toolbar
- View current and last used tab information
- Click "Switch to Last Used Tab" button

## How It Works

The extension tracks tab activation events and maintains a record of:
- Current active tab
- Last used tab (the tab you were on before the current one)

When you use the keyboard shortcut or click the switch button, it activates the last used tab, making tab switching quick and efficient.

## Files Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker that tracks tab usage
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `icon*.png` - Extension icons (add your own 16x16, 48x48, 128x128 PNG files)

## Customization

You can customize the keyboard shortcut by:
1. Going to `chrome://extensions/shortcuts`
2. Finding "Last Used Tab Switcher"
3. Setting your preferred key combination

## Notes

- The extension requires "tabs" permission to track and switch between tabs
- Tab tracking starts when the extension is installed/enabled
- If the last used tab is closed, the extension will handle this gracefully
