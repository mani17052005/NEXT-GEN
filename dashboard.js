let currentTab = "glucose";
let chart;
let history = [];
let stepCount = 0;
let lastStepTime = 0;
const MAX_HISTORY = 100;

// Profile Load
window.addEventListener("DOMContentLoaded", () => {
  const profile = JSON.parse(localStorage.getItem("profile"));
  if (!profile) window.location.href = "index.html";
  document.getElementById("pName").innerText = profile.name;
  document.getElementById("pAge").innerText = profile.age;
  document.getElementById("pGender").innerText = profile.gender;
  document.getElementById("pHeight").innerText = profile.height;
  document.getElementById("pWeight").innerText = profile.weight;
});

// Tab Switching
function setActiveTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add("active");

  document.querySelector(".metric-card").classList.add("hidden");
  document.querySelector(".chart-card").classList.add("hidden");
  document.getElementById("stepsSection").classList.add("hidden");
  document.getElementById("historySection").classList.add("hidden");

  if (tab === "steps") {
    document.getElementById("stepsSection").classList.remove("hidden");
  } else if (tab === "history") {
    document.getElementById("historySection").classList.remove("hidden");
    renderHistory();
  } else {
    document.querySelector(".metric-card").classList.remove("hidden");
    document.querySelector(".chart-card").classList.remove("hidden");
    updateChart(tab);
  }
}

// Simulate readings for Glucose, BP, Temp, Heart
function simulateReading() {
  let value;
  if (currentTab === "glucose") {
    value = Math.floor(Math.random() * 80) + 80; // 80–160 mg/dL
  } else if (currentTab === "bp") {
    value = `${Math.floor(Math.random() * 60 + 100)}/${Math.floor(Math.random() * 40 + 60)}`; // mmHg
  } else if (currentTab === "temp") {
    value = (36 + Math.random() * 2).toFixed(1); // °C
  } else if (currentTab === "heart") {
    value = Math.floor(Math.random() * 40 + 60); // bpm
  }

  document.getElementById("metricValue").innerText = value;
  document.getElementById("latestReading").innerText = `Latest: ${value}`;
  document.getElementById("metricTitle").innerText = currentTab.toUpperCase();
  document.getElementById("chartTitle").innerText = `${currentTab.toUpperCase()} Trend`;

  addToHistory(currentTab, value);
  aiSuggestions(currentTab, value);
}

// Chart Setup
function updateChart(tab) {
  const ctx = document.getElementById("metricChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.map(h => h.time),
      datasets: [{
        label: tab,
        data: history.filter(h => h.type === tab).map(h => h.value),
        borderColor: tab === "glucose" ? "red" :
                     tab === "bp" ? "blue" :
                     tab === "temp" ? "orange" : "green",
        fill: false
      }]
    }
  });
}

// History
function addToHistory(type, value) {
  const now = new Date().toLocaleTimeString();
  history.push({ type, value, time: now });
  if (history.length > MAX_HISTORY) history.shift();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  history.slice(-MAX_HISTORY).forEach(h => {
    const li = document.createElement("li");
    li.textContent = `[${h.time}] ${h.type}: ${h.value}`;
    list.appendChild(li);
  });
}

// AI Suggestions
function aiSuggestions(type, value) {
  const suggestions = document.getElementById("suggestionList");
  suggestions.innerHTML = "";
  let msg = "";

  if (type === "glucose") {
    if (value > 180) msg = "⚠️ High glucose. Walk 10,000+ steps today.";
    else if (value > 140) msg = "Slightly high glucose. Aim for ~8,500 steps.";
    else if (value < 70) msg = "⚠️ Low glucose. Eat first, avoid walking until stable.";
    else msg = "Normal glucose. Maintain with ~5,000–7,000 steps.";
  }

  if (type === "bp" && typeof value === "string") {
    const [sys, dia] = value.split("/").map(Number);
    if (sys > 140 || dia > 90) msg = "⚠️ High BP. Reduce salt, manage stress.";
  }

  if (type === "temp" && value > 37.5) {
    msg = "Mild fever. Stay hydrated and rest.";
  }

  if (type === "heart" && value > 100) {
    msg = "High heart rate. Avoid stress, rest well.";
  }

  if (msg) {
    const li = document.createElement("li");
    li.textContent = msg;
    suggestions.appendChild(li);
  }
}

// Step Counter
function startStepCounter() {
  if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", function(event) {
      let acc = event.accelerationIncludingGravity;
      let totalAcc = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
      let now = Date.now();

      if (totalAcc > 12 && (now - lastStepTime > 250)) {
        stepCount++;
        lastStepTime = now;
        updateStepUI();
      }
    });
  } else {
    // Simulation for desktop
    setInterval(() => {
      stepCount += Math.floor(Math.random() * 5);
      updateStepUI();
    }, 3000);
  }
}

function updateStepUI() {
  document.getElementById("steps").innerText = stepCount + " steps";
  document.getElementById("distance").innerText = (stepCount*0.0008).toFixed(2) + " km";
  document.getElementById("calories").innerText = (stepCount*0.04).toFixed(1) + " kcal";
}

// Dark/Light mode toggle
document.getElementById("modeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("profile");
  window.location.href = "index.html";
});

// Start
setInterval(simulateReading, 5000);
startStepCounter();
