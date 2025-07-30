document.addEventListener('DOMContentLoaded', async () => {
  const switchButton = document.getElementById('switchButton');
  const statusDiv = document.getElementById('status');
  
  // Get tab information from background script
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getTabInfo' });
    updateStatus(response);
  } catch (error) {
    console.error('Error getting tab info:', error);
    statusDiv.textContent = 'Error loading tab information';
  }
  
  // Handle switch button click
  switchButton.addEventListener('click', async () => {
    try {
      switchButton.disabled = true;
      switchButton.textContent = 'Switching...';
      
      await chrome.runtime.sendMessage({ action: 'switchToLastTab' });
      
      // Close popup after switching
      window.close();
    } catch (error) {
      console.error('Error switching tabs:', error);
      switchButton.disabled = false;
      switchButton.textContent = 'Switch to Last Used Tab';
    }
  });
});

function updateStatus(tabInfo) {
  const statusDiv = document.getElementById('status');
  const switchButton = document.getElementById('switchButton');
  
  if (tabInfo.lastUsedTabId) {
    statusDiv.innerHTML = `
      <div>Current Tab ID: ${tabInfo.currentTabId || 'Unknown'}</div>
      <div>Last Used Tab ID: ${tabInfo.lastUsedTabId}</div>
    `;
    switchButton.disabled = false;
  } else {
    statusDiv.textContent = 'No last used tab available. Switch between tabs first.';
    switchButton.disabled = true;
  }
}
