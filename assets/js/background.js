
chrome.runtime.onInstalled.addListener(() => {
  console.log("Review Scraper Extension Installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startScraping") {
    console.log("Starting scraping...");
    chrome.scripting.executeScript({
      target: {tabId: sender.tab.id},
      function: scrapeAllPages
    });
  }
});

function scrapeAllPages() {
  // Insert your scraping code here
  console.log("Scraping started on content page.");
}
    