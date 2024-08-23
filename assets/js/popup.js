// Function to enable or disable buttons based on the URL
function checkUrlAndSetButtonState() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabUrl = tabs[0].url;
    const isEtsyListing = tabUrl.includes("etsy.com/listing/");

    const jsonButton = document.getElementById("json-scraping");
    const csvButton = document.getElementById("csv-scraping");

    if (isEtsyListing) {
      jsonButton.disabled = false;
      csvButton.disabled = false;
      jsonButton.style.backgroundColor = "#4CAF50";
      csvButton.style.backgroundColor = "#4CAF50";
      jsonButton.style.cursor = "pointer";
      csvButton.style.cursor = "pointer";
    } else {
      jsonButton.disabled = true;
      csvButton.disabled = true;
      jsonButton.style.backgroundColor = "#cccccc";
      csvButton.style.backgroundColor = "#cccccc";
      jsonButton.style.cursor = "not-allowed";
      csvButton.style.cursor = "not-allowed";
    }
  });
}

// Event listeners for the buttons
document.getElementById("json-scraping").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "json-scraping" });
  });
});

document.getElementById("csv-scraping").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "csv-scraping" });
  });
});

// Initialize button state when the popup is loaded
document.addEventListener("DOMContentLoaded", checkUrlAndSetButtonState);