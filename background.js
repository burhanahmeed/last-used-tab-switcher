// Track tab history (most recent first)
let tabHistory = [];
let currentTabId = null;
let currentWindowId = null;

// Storage keys
const STORAGE_KEYS = {
  TAB_HISTORY: 'tabHistory',
  CURRENT_TAB_ID: 'currentTabId',
  CURRENT_WINDOW_ID: 'currentWindowId'
};

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
  
  // Persist to storage
  saveState();
}

// Save state to persistent storage
async function saveState() {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.TAB_HISTORY]: tabHistory,
      [STORAGE_KEYS.CURRENT_TAB_ID]: currentTabId,
      [STORAGE_KEYS.CURRENT_WINDOW_ID]: currentWindowId
    });
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// Load state from persistent storage
async function loadState() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.TAB_HISTORY,
      STORAGE_KEYS.CURRENT_TAB_ID,
      STORAGE_KEYS.CURRENT_WINDOW_ID
    ]);
    
    tabHistory = result[STORAGE_KEYS.TAB_HISTORY] || [];
    currentTabId = result[STORAGE_KEYS.CURRENT_TAB_ID] || null;
    currentWindowId = result[STORAGE_KEYS.CURRENT_WINDOW_ID] || null;
    
    console.log('Loaded state:', { tabHistory, currentTabId, currentWindowId });
  } catch (error) {
    console.error('Error loading state:', error);
  }
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
    // Load previous state first
    await loadState();
    
    // Get the currently active tab and window
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (activeTab) {
      // If we have a different active tab than stored, update history
      if (currentTabId && currentTabId !== activeTab.id) {
        addToHistory(currentTabId);
      }
      currentTabId = activeTab.id;
      currentWindowId = activeTab.windowId;
      await saveState();
      console.log('Initialized with current tab:', currentTabId, 'in window:', currentWindowId);
    }
    
    // Clean up history - remove tabs that no longer exist
    await cleanupTabHistory();
    
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

// Clean up tab history by removing tabs that no longer exist
async function cleanupTabHistory() {
  const validTabIds = [];
  
  for (const tabId of tabHistory) {
    try {
      await chrome.tabs.get(tabId);
      validTabIds.push(tabId);
    } catch (error) {
      // Tab no longer exists, don't add to valid list
      console.log(`Removed non-existent tab ${tabId} from history`);
    }
  }
  
  if (validTabIds.length !== tabHistory.length) {
    tabHistory = validTabIds;
    await saveState();
    console.log('Cleaned up tab history:', tabHistory);
  }
}

// Listen for tab activation changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Add previous current tab to history
  if (currentTabId && currentTabId !== activeInfo.tabId) {
    addToHistory(currentTabId);
  }
  
  // Update current tab and window
  currentTabId = activeInfo.tabId;
  currentWindowId = activeInfo.windowId;
  await saveState();
  
  const lastUsedTabId = getLastUsedTabId();
  console.log(`Tab switched: Current=${currentTabId}, Last=${lastUsedTabId}, Window=${currentWindowId}`);
  console.log('Tab history:', tabHistory);
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // No window is focused
    return;
  }
  
  try {
    // Get the active tab in the focused window
    const [activeTab] = await chrome.tabs.query({ active: true, windowId: windowId });
    if (activeTab) {
      // Add previous current tab to history if different
      if (currentTabId && currentTabId !== activeTab.id) {
        addToHistory(currentTabId);
      }
      
      currentTabId = activeTab.id;
      currentWindowId = windowId;
      await saveState();
      
      const lastUsedTabId = getLastUsedTabId();
      console.log(`Window focused: Current=${currentTabId}, Last=${lastUsedTabId}, Window=${windowId}`);
      console.log('Tab history:', tabHistory);
    }
  } catch (error) {
    console.error('Error handling window focus change:', error);
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`Tab removed: ${tabId}`);
  
  // Remove from history
  tabHistory = tabHistory.filter(id => id !== tabId);
  
  // If current tab was closed, we need to find the new current tab
  if (tabId === currentTabId) {
    // Get the new active tab
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      if (tabs.length > 0) {
        currentTabId = tabs[0].id;
        currentWindowId = tabs[0].windowId;
        await saveState();
        console.log(`New current tab after closure: ${currentTabId} in window ${currentWindowId}`);
      } else {
        currentTabId = null;
        currentWindowId = null;
        await saveState();
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
        // Focus the window containing the tab first
        await chrome.windows.update(tab.windowId, { focused: true });
        // Then switch to the last used tab
        await chrome.tabs.update(lastUsedTabId, { active: true });
        console.log(`Switched to last used tab: ${lastUsedTabId} in window ${tab.windowId}`);
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
