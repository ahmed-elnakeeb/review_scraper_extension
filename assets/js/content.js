
// Data storage object
var data = {};

// Function to save data as a JSON file
function saveData() {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviews_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    data={};
}

// Function to convert the date to YYYY-MM-DD format
function formatDateForExcel(dateString) {
    const dateParts = dateString.split(' ');
    const month = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12"
    }[dateParts[0]];
    const day = dateParts[1].replace(',', '').padStart(2, '0'); // Remove the comma and pad the day with a leading zero
    const year = dateParts[2];
    
    return `${year}-${month}-${day}`;
}

// Function to collect data from the current page
function collectPageData() {
    // Collect reviews on the current page
    const reviews = document.querySelectorAll("[data-review-region]");
    
    reviews.forEach((review) => {
        const rating = review.querySelector("input[name='rating']")?.value;
        const reviewText = review.querySelector("[data-review-text-toggle-wrapper] .wt-text-truncate--multi-line")?.innerText.trim() || "No review text available";
        
        // Extract the reviewer's profile URL
        const reviewerElement = review.querySelector("a[rel='nofollow']");
        const reviewerURL = reviewerElement ? reviewerElement.href : "No profile URL available";
        
        // Extract the correct date using a regular expression to capture "Month Day, Year"
        const dateElement = review.querySelector("p.wt-text-caption.wt-text-gray");
        let dateText = "No date available";
        if (dateElement) {
            const dateMatch = dateElement.innerText.match(/([A-Za-z]+\s\d{1,2},\s\d{4})/);
            if (dateMatch) {
                dateText = formatDateForExcel(dateMatch[0]);
            }
        }

        // Adjusting the selector to correctly get the purchased item link
        const itemLinkElement = review.querySelector('a[data-review-link]');
        const itemLink = itemLinkElement ? itemLinkElement.href :window.location.href; // Check if the element exists

        // Save the data to the data object
        data[`review_${Object.keys(data).length + 1}`] = {
            rating: rating || "No rating available",
            text: reviewText,
            reviewerURL: reviewerURL, // Add the reviewer's profile URL to the data
            date: dateText, // Correctly formatted date in YYYY-MM-DD
            itemLink: itemLink // Add the purchased item link to the data
        };
    });
}

async function nextPage() {
    const nextButton = document.getElementsByClassName("wt-action-group__item wt-btn wt-btn--small wt-btn--icon")[1];
    
    // Check if the next button exists and is not disabled
    if (nextButton && !nextButton.classList.contains("wt-is-disabled")) {
        nextButton.click();
        return true;
    } else {
        return false;
    }
}

// Function to wait for the page to load
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to scrape all pages
async function scrapeAllPages() {
        // Initial setup: click on the "Shop reviews" tab to load the reviews
    try {
        const shop = document.getElementById("shop-reviews-tab");
        shop.click();
    } catch (error) {
        console.log("Error clicking on the Shop reviews tab:", error);
    }

    let hasNextPage = true;

    while (hasNextPage) {
        console.log("Scraping new page...");
        
        collectPageData();
        console.log(`Scraped ${Object.keys(data).length} reviews so far.`);
        
        hasNextPage = await nextPage();
        console.log("Next page available:", hasNextPage);
        
        if (hasNextPage) {
            console.log("Waiting for page to load...");
            await wait(1000); // Wait for 1 seconds before moving to the next page
        }
    }

    // Once all pages are scraped, save the data
    console.log("Scraping completed. Saving data...");
    saveData();
}


//if the site is an etsy listing log ready
if (window.location.hostname.includes("https://www.etsy.com/listing/") ){
    console.log("Etsy listing detected. Ready to scrape.");
}


// Trigger the scraping function only when the extension icon is clicked
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.action);
    if (request.action === "json-scraping") {
        
        // Start the scraping process
        scrapeAllPages();
        sendResponse({ status: "Scraping started" });
    }
});