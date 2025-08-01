// Track tab history (most recent first)
let tabHistory = [];
let currentTabId = null;

// Helper function to get the last used tab (excluding current)
function getLastUsedTabId() {
  return tabHistory.find(tabId => tabId !== currentTabId) || null;
}

// Helper function to add tab to history
function addToHistory(tabId) {
  if (!tabId) return;
  
  // Remove if already exists
  tabHistory = tabHistory.filter(id => id !== tabId);
  // Add to front
  tabHistory.unshift(tabId);
  // Keep only last 10 tabs
  tabHistory = tabHistory.slice(0, 10);
}

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
  // Add previous current tab to history
  if (currentTabId && currentTabId !== activeInfo.tabId) {
    addToHistory(currentTabId);
  }
  
  // Update current tab
  currentTabId = activeInfo.tabId;
  
  const lastUsedTabId = getLastUsedTabId();
  console.log(`Tab switched: Current=${currentTabId}, Last=${lastUsedTabId}`);
  console.log('Tab history:', tabHistory);
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`Tab removed: ${tabId}`);
  
  // Remove from history
  tabHistory = tabHistory.filter(id => id !== tabId);
  
  // If current tab was closed, we need to find the new current tab
  if (tabId === currentTabId) {
    // Get the new active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        currentTabId = tabs[0].id;
        console.log(`New current tab after closure: ${currentTabId}`);
      } else {
        currentTabId = null;
      }
    });
  }
  
  console.log('Updated tab history after removal:', tabHistory);
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  console.log('Command type:', typeof command);
  
  if (command === 'switch-to-last-tab') {
    console.log('Switching to last used tab via keyboard shortcut');
    await switchToLastUsedTab();
  } else if (command === 'duplicate-tab') {
    console.log('Duplicating current tab via keyboard shortcut');
    await duplicateCurrentTab();
  } else {
    console.log('Unknown command received:', command);
  }
});

// Function to switch to last used tab
async function switchToLastUsedTab() {
  try {
    const lastUsedTabId = getLastUsedTabId();
    
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
      // Tab doesn't exist anymore, remove it from history and try next
      console.log(`Tab ${lastUsedTabId} no longer exists, removing from history`);
      tabHistory = tabHistory.filter(id => id !== lastUsedTabId);
      
      // Try the next tab in history
      const nextLastUsedTabId = getLastUsedTabId();
      if (nextLastUsedTabId) {
        console.log(`Trying next tab in history: ${nextLastUsedTabId}`);
        await switchToLastUsedTab(); // Recursive call to try next tab
      } else {
        console.log('No more tabs in history');
      }
    }
  } catch (error) {
    console.error('Error switching to last used tab:', error);
  }
}

// Function to duplicate current tab
async function duplicateCurrentTab() {
  try {
    // Get the currently active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) {
      console.log('No active tab found');
      return;
    }

    // Create a duplicate of the current tab
    const duplicatedTab = await chrome.tabs.create({
      url: activeTab.url,
      index: activeTab.index + 1, // Place the new tab right after the current one
      active: true // Make the duplicated tab active
    });
    
    console.log(`Duplicated tab: ${activeTab.id} -> ${duplicatedTab.id}`);
    console.log(`Duplicated URL: ${activeTab.url}`);
  } catch (error) {
    console.error('Error duplicating current tab:', error);
  }
}

// Message handler for popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'switchToLastTab') {
    switchToLastUsedTab();
    sendResponse({ success: true });
  } else if (request.action === 'duplicateTab') {
    duplicateCurrentTab();
    sendResponse({ success: true });
  } else if (request.action === 'getTabInfo') {
    sendResponse({
      currentTabId: currentTabId,
      lastUsedTabId: getLastUsedTabId(),
      tabHistory: tabHistory
    });
  }
});
