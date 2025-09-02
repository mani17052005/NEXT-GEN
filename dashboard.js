const USERS_KEY = "ht_users";
const SESSION_KEY = "ht_session";

let currentUser, users, healthChart;

function loadUsers(){
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSessionUser(){
  const uname = localStorage.getItem(SESSION_KEY);
  users = loadUsers();
  return users.find(u => u.username === uname);
}

function logout(){
  localStorage.removeItem(SESSION_KEY);
  window.location = "index.html";
}

function addRandomReading(){
  const r = {
    time: Date.now(),
    glucose: Math.floor(Math.random()*100)+70,
    bpSys: Math.floor(Math.random()*40)+100,
    bpDia: Math.floor(Math.random()*30)+60,
    heart: Math.floor(Math.random()*40)+60,
    temp: (36 + Math.random()*1.5).toFixed(1)
  };
  currentUser.readings.push(r);
  saveUsers();
  renderHistory();
  renderGraph();
}

// History render
function renderHistory(){
  const log = document.getElementById("historyLog");
  log.innerHTML = "";
  currentUser.readings.slice(-30).reverse().forEach(r=>{
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerText = `${new Date(r.time).toLocaleString()} | Glucose:${r.glucose} | BP:${r.bpSys}/${r.bpDia} | HR:${r.heart} | Temp:${r.temp}`;
    log.appendChild(div);
  });
}

// Graph render
function renderGraph(){
  const ctx = document.getElementById("healthChart").getContext("2d");
  if(healthChart) healthChart.destroy();
  const labels = currentUser.readings.map(r=>new Date(r.time).toLocaleTimeString());
  healthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {label:"Glucose", data: currentUser.readings.map(r=>r.glucose), borderColor:"red"},
        {label:"BP Sys", data: currentUser.readings.map(r=>r.bpSys), borderColor:"green"},
        {label:"Heart", data: currentUser.readings.map(r=>r.heart), borderColor:"blue"},
        {label:"Temp", data: currentUser.readings.map(r=>r.temp), borderColor:"orange"}
      ]
    },
    options:{responsive:true}
  });
}

// CSV Download
document.getElementById("downloadCsvBtn").addEventListener("click", ()=>{
  let rows = [["Time","Glucose","BP Sys","BP Dia","Heart","Temp"]];
  currentUser.readings.forEach(r=>{
    rows.push([new Date(r.time).toLocaleString(), r.glucose, r.bpSys, r.bpDia, r.heart, r.temp]);
  });
  let csv = rows.map(r=>r.join(",")).join("\n");
  let blob = new Blob([csv],{type:"text/csv"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "history.csv";
  a.click();
});

// Profile Menu
document.getElementById("menuBtn").addEventListener("click", ()=>{
  document.getElementById("profileMenu").style.display =
    document.getElementById("profileMenu").style.display === "block" ? "none" : "block";
});

// Init
window.onload = ()=>{
  currentUser = getSessionUser();
  if(!currentUser) return logout();
  document.getElementById("profileName").innerText = "👤 " + currentUser.username;
  document.getElementById("profileAge").innerText = "🎂 Age: " + currentUser.age;
  document.getElementById("profileGender").innerText = "⚧ Gender: " + currentUser.gender;
  document.getElementById("profileCondition").innerText = "💊 Condition: " + currentUser.condition;

  // generate initial random data if empty
  if(currentUser.readings.length < 5){
    for(let i=0;i<5;i++) addRandomReading();
  }

  renderHistory();
  renderGraph();

  // auto-generate new readings every 1s
  setInterval(addRandomReading, 1000);
};

