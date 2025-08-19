const form = document.getElementById("inputForm");
const methodSelect = document.getElementById("method");
const urlInput = document.getElementById("url");
const bodyGroup = document.getElementById("bodyGroup");
const bodyTextarea = document.getElementById("body-json");
const jsonResponseContainer = document.getElementById(
  "json-response-container"
);
const statusInfo = document.getElementById("statusInfo");

window.onload = renderAPIForms;

const apiFormsOptions = {
  iconlib: "fontawesome5",
  object_layout: "normal",
  show_errors: "interaction",
  theme: "bootstrap4",
};

async function renderAPIForms() {
  await renderAPIForm("access-incoming");
  await renderAPIForm("access-quote");
  await renderAPIForm("access-outgoing");
  await renderAPIForm("continue");
  await renderAPIForm("incoming-payment");
  await renderAPIForm("quote");
  await renderAPIForm("outgoing-payment");
  await renderAPIForm("manage-token");
  await renderAPIForm("cancel-access");
  await renderAPIForm("wallet-address");
}

async function renderAPIForm(endpoint) {
  // get the schema
  const response = await axios.get(`/schemas/${endpoint}.json`);

  if (response.status != 200) {
    showResponse(response, 0);
    return;
  }

  const grantRequestSchema = await response.data; // Parse as JSON
  console.log(`** ${endpoint} request schema `);
  console.log(grantRequestSchema);

  // create the ui form
  const element = document.getElementById(`${endpoint}-holder`);
  const editor = new JSONEditor(element, {
    ...apiFormsOptions,
    ...{ schema: grantRequestSchema },
  });

  // set default
  editor.on("ready", () => {
    const defaultData = localStorage.getItem(endpoint);
    if (defaultData) editor.setValue(JSON.parse(defaultData));
  });

  // listen for the submit event
  document
    .getElementById(`${endpoint}-submit`)
    .addEventListener("click", function (event) {
      makeRequest(event, "POST", endpoint, editor.getValue());
    });
}

async function makeRequest(event, method, path, data) {
  event.preventDefault();

  const baseUrl = "http://localhost:3001/api/";
  let url = baseUrl + path;

  // store in local storage
  localStorage.setItem(`${path}`, JSON.stringify(data));

  // Disable submit button
  const submitBtn = event.target;
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>';

  try {
    // Collect headers (existing functionality)
    const headers = { "Content-Type": "application/json" };

    // build request config
    const config = {
      method: method,
      url: url,
      headers: headers,
    };

    config.timeout = 50000; // ms
    config.maxRedirects = 5;
    config.data = JSON.stringify(data);

    console.log("** config");
    console.log(config);

    // make request
    const startTime = Date.now();
    const response = await axios(config);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // show response
    showResponse(response, duration);

    // add to history
    addToHistory(
      {
        method: method,
        url: url,
        headers: headers,
        data: data,
      },
      {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      },
      duration
    );
  } catch (error) {
    console.log("** error");
    console.log(error);

    showResponse(error.response, 0);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function showResponse(response, duration) {
  // Display success response
  console.log("<< request response");
  console.log(response);

  const statusClass =
    response.status >= 200 && response.status < 300
      ? "status-success"
      : "status-error";

  statusInfo.innerHTML = `
          <span class="status-badge ${statusClass}">${response.status} ${response.statusText}</span>
          <span style="color: #a0aec0;">• ${duration}ms</span>
      `;

  if (response.data) jsonResponseContainer.data = response.data;
}

/** Request history functionality */

const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
let requestHistory = [];

// Load history from localStorage if available
function loadHistory() {
  const savedHistory = localStorage.getItem("responseHistory");
  if (savedHistory) {
    try {
      requestHistory = JSON.parse(savedHistory);
      updateHistoryUI();
    } catch (e) {
      console.error("Failed to parse history:", e);
      requestHistory = [];
    }
  }
}

// Save history to localStorage
function saveHistory() {
  try {
    localStorage.setItem("responseHistory", JSON.stringify(requestHistory));
  } catch (e) {
    console.error("Failed to save history:", e);
  }
}

// Add a request to history
function addToHistory(request, response, duration) {
  const timestamp = new Date().toISOString();
  const historyItem = {
    id: Date.now(),
    method: request.method,
    url: request.url,
    status: response.status,
    statusText: response.statusText,
    duration: duration,
    timestamp: timestamp,
    request: request,
    response: response.data,
  };

  // Add to beginning of array (newest first)
  requestHistory.unshift(historyItem);

  // Limit history to 50 items
  if (requestHistory.length > 50) {
    requestHistory.pop();
  }

  saveHistory();
  updateHistoryUI();
}

// Update the history UI
function updateHistoryUI() {
  historyCount.textContent = requestHistory.length;

  if (requestHistory.length === 0) {
    historyList.innerHTML =
      '<div class="panel-empty">No request history yet</div>';
    return;
  }

  historyList.innerHTML = "";

  requestHistory.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.dataset.id = item.id;

    const statusClass =
      item.status >= 200 && item.status < 300
        ? "status-success"
        : "status-error";

    const date = new Date(item.timestamp);
    const timeString = date.toLocaleTimeString();
    const dateString = date.toLocaleDateString();

    historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-method">${item.method}</span>
                <span class="history-item-status ${statusClass}">${item.status} ${item.statusText}</span>
            </div>
            <div class="history-item-url">${item.url}</div>
            <div class="history-item-time">${timeString} ${dateString} • ${item.duration}ms</div>
        `;

    historyItem.addEventListener("click", () => {
      // Mark this item as active
      document.querySelectorAll(".history-item").forEach((el) => {
        el.classList.remove("active");
      });
      historyItem.classList.add("active");

      console.log("** history response");
      console.log(item.response.data);

      if (item.response.data) jsonResponseContainer.data = item.response.data;
    });

    historyList.appendChild(historyItem);
  });
}

// Clear history
clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all request history?")) {
    requestHistory = [];
    saveHistory();
    updateHistoryUI();
  }
});

// Load history on page load
loadHistory();

// check for interaction ref on page load
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const interactRef = params.get("interact_ref");
  const hash = params.get("hash") ?? "";

  if (interactRef) {
    addToHistory(
      {
        method: "GET",
        url: window.location.href,
        headers: "",
        data: { data: { interactRef: interactRef, hash: hash } },
      },
      {
        status: "200",
        statusText: "OK",
        data: { data: { interactRef: interactRef, hash: hash } },
        headers: "",
      },
      0
    );

    const url = new URL(window.location.href);
    url.searchParams.delete("interact_ref");
    url.searchParams.delete("hash");
    window.history.replaceState({}, document.title, url.pathname);
  }
});
