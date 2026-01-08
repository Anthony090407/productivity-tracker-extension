let activeSite = null;
let startTime = null;

const productiveSites = ['github.com', 'leetcode.com', 'stackoverflow.com'];
const unproductiveSites = ['youtube.com', 'instagram.com', 'facebook.com'];

chrome.tabs.onActivated.addListener(async (info) => {
  const tab = await chrome.tabs.get(info.tabId);
  if (tab?.url) track(tab.url);
});

chrome.tabs.onUpdated.addListener((id, change, tab) => {
  if (change.status === "complete" && tab?.url) {
    track(tab.url);
  }
});

function track(url) {
  if (!url.startsWith("http")) return;

  const now = Date.now();

  if (activeSite && startTime) {
    const timeSpent = now - startTime;
    const category = getCategory(activeSite);
    sendData(activeSite, timeSpent, category);
  }

  activeSite = new URL(url).hostname;
  startTime = now;
}

function getCategory(site) {
  if (productiveSites.some(s => site.includes(s))) return "productive";
  return "unproductive";
}

function sendData(site, time, category) {
  fetch("http://localhost:5000/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site, time, category })
  }).catch(() => {});
}
