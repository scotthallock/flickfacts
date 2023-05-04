// Create the context menu button
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: '1',
    title: 'Get FlickFacts for "%s"',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const response = await chrome.tabs.sendMessage(tab.id, {
      greeting: 'get_movie_data',
    });
  })();
});
