// Track the last used tab
let lastUsedTabId = null;
let currentTabId = null;

// Test that the script is loading
console.log('Background script loaded successfully!');
console.log('Chrome APIs available:', {
  tabs: !!chrome.tabs,
  commands: !!chrome.commands,
  runtime: !!chrome.runtime
});

// Initialize when extension starts
chrome.runtime.onStartup.addListener(() => {
  initializeTabTracking();
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/enabled');
  initializeTabTracking();
});

async function initializeTabTracking() {
  try {
    // Get the currently active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      currentTabId = activeTab.id;
      console.log('Initialized with current tab:', currentTabId);
    }
    
    // Test if commands are registered
    const commands = await chrome.commands.getAll();
    console.log('Registered commands:', commands);
    console.log('Number of commands:', commands.length);
    commands.forEach(cmd => {
      console.log(`Command: ${cmd.name}, Shortcut: ${cmd.shortcut}, Description: ${cmd.description}`);
    });
  } catch (error) {
    console.error('Error initializing tab tracking:', error);
  }
}

// Listen for tab activation changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Store the previous current tab as the last used tab
  if (currentTabId && currentTabId !== activeInfo.tabId) {
    lastUsedTabId = currentTabId;
  }
  
  // Update current tab
  currentTabId = activeInfo.tabId;
  
  console.log(`Tab switched: Current=${currentTabId}, Last=${lastUsedTabId}`);
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === lastUsedTabId) {
    lastUsedTabId = null;
  }
  if (tabId === currentTabId) {
    currentTabId = null;
  }
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  console.log('Command type:', typeof command);
  console.log('Expected command: switch-to-last-tab');
  console.log('Commands match:', command === 'switch-to-last-tab');
  
  if (command === 'switch-to-last-tab') {
    console.log('Switching to last used tab via keyboard shortcut');
    await switchToLastUsedTab();
  } else {
    console.log('Unknown command received:', command);
  }
});

// Function to switch to last used tab
async function switchToLastUsedTab() {
  try {
    if (!lastUsedTabId) {
      console.log('No last used tab available');
      return;
    }

    // Check if the last used tab still exists
    try {
      const tab = await chrome.tabs.get(lastUsedTabId);
      if (tab) {
        // Switch to the last used tab
        await chrome.tabs.update(lastUsedTabId, { active: true });
        console.log(`Switched to last used tab: ${lastUsedTabId}`);
      }
    } catch (error) {
      // Tab doesn't exist anymore
      console.log('Last used tab no longer exists');
      lastUsedTabId = null;
    }
  } catch (error) {
    console.error('Error switching to last used tab:', error);
  }
}

// Message handler for popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'switchToLastTab') {
    switchToLastUsedTab();
    sendResponse({ success: true });
  } else if (request.action === 'getTabInfo') {
    sendResponse({
      currentTabId: currentTabId,
      lastUsedTabId: lastUsedTabId
    });
  }
});
