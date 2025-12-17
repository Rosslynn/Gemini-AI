
/**
 * Configures the side panel to open whenever the extension icon is clicked.
 * This replaces the default popup behavior or the context menu requirement.
 */
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));
