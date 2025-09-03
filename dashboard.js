const SESSION_KEY = "ht_session";
const PROFILE_KEY = "ht_profile";
const HISTORY_KEY = "ht_history";

const $ = id => document.getElementById(id);

// Session
let session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
if (!session) location.href = "index.html";

// Logout
$("logoutBtn").onclick = () => {
  localStorage.removeItem(SESSION_KEY);
  location.href = "index.html";
};

// Profile Load
let profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
function renderProfile() {
  $("pName").textContent = profile.name || "--";
  $("pAge").textContent = profile.age || "--";
  $("pGender").textContent = profile.gender || "--";
  $("pPref").textContent = profile.pref || "--";
}
renderProfile();

// Profile Modal
$("editProfileBtn").onclick = () => {
  $("profileModal").style.display = "block";
  $("inputName").value = profile.name || "";
  $("inputAge").value = profile.age || "";
  $("inputGender").value = profile.gender || "";
  $("inputPref").value = profile.pref || "";
};
$("saveProfileBtn").onclick = () => {
  profile = {
    name: $("inputName").value,
    age: $("inputAge").value,
    gender: $("inputGender").value,
    pref: $("inputPref").value
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  $("profileModal").style.display = "none";
  renderProfile();
};
function closeProfileModal() { $("profileModal").style.display = "none"; }

// Graph Data
let glucoseData = [], bpSysData = [], bpDiaData = [], tempData = [], heartData = [], labels = [];
let glucoseHistory = [], bpHistory = [], tempHistory = [], hrHistory = [];

// Charts
const glucoseChart = new Chart($("glucoseChart").getContext("2d"), { type: "line", data:{ labels, datasets:[{label:"Glucose",borderColor:"red",data:glucoseData}] }});
const bpChart = new Chart($("bpChart").getContext("2d"), { type:"line", data:{ labels, datasets:[
  {label:"Systolic",borderColor:"blue",data:bpSysData},
  {label:"Diastolic",borderColor:"green",data:bpDiaData}
]}});
const tempChart = new Chart($("tempChart").getContext("2d"), { type:"line", data:{ labels, datasets:[{label:"Temperature",borderColor:"orange",data:tempData}] }});
const heartChart = new Chart($("heartChart").getContext("2d"), { type:"line", data:{ labels, datasets:[{label:"Heart Rate",borderColor:"purple",data:heartData}] }});

// Tabs
function setTab(tab) {
  document.querySelectorAll(".graph-section, #historySection").forEach(sec => sec.style.display="none");
  if(tab==="glucose") $("glucoseSection").style.display="block";
  if(tab==="bp") $("bpSection").style.display="block";
  if(tab==="temp") $("tempSection").style.display="block";
  if(tab==="heart") $("heartSection").style.display="block";
  if(tab==="history") { $("historySection").style.display="block"; renderHistory(); }
}

// Tick (simulate readings)
function tick() {
  let now = new Date().toLocaleTimeString();
  labels.push(now); if(labels.length>20) labels.shift();

  let g = Math.floor(80+Math.random()*40);
  let s = Math.floor(110+Math.random()*30);
  let d = Math.floor(70+Math.random()*15);
  let t = +(36+Math.random()*2).toFixed(1);
  let h = Math.floor(60+Math.random()*40);

  glucoseData.push(g); if(glucoseData.length>20) glucoseData.shift();
  bpSysData.push(s); if(bpSysData.length>20) bpSysData.shift();
  bpDiaData.push(d); if(bpDiaData.length>20) bpDiaData.shift();
  tempData.push(t); if(tempData.length>20) tempData.shift();
  heartData.push(h); if(heartData.length>20) heartData.shift();

  glucoseHistory.push({value:g,time:now});
  bpHistory.push({value:s+"/"+d,time:now});
  tempHistory.push({value:t,time:now});
  hrHistory.push({value:h,time:now});

  glucoseChart.update(); bpChart.update(); tempChart.update(); heartChart.update();
}
setInterval(tick,2000);

// History
function renderHistory() {
  let log = $("historyLog");
  log.innerHTML = "";
  glucoseHistory.slice(-20).forEach(r => log.innerHTML += `<p>🩸 Glucose: ${r.value} at ${r.time}</p>`);
  bpHistory.slice(-20).forEach(r => log.innerHTML += `<p>🩺 BP: ${r.value} at ${r.time}</p>`);
  tempHistory.slice(-20).forEach(r => log.innerHTML += `<p>🌡️ Temp: ${r.value} at ${r.time}</p>`);
  hrHistory.slice(-20).forEach(r => log.innerHTML += `<p>❤️ Heart: ${r.value} at ${r.time}</p>`);
}

// Export CSV
$("exportCSV").onclick = () => {
  let csv = "Type,Value,Time\n";
  glucoseHistory.forEach(r=> csv+=`Glucose,${r.value},${r.time}\n`);
  bpHistory.forEach(r=> csv+=`Blood Pressure,${r.value},${r.time}\n`);
  tempHistory.forEach(r=> csv+=`Temperature,${r.value},${r.time}\n`);
  hrHistory.forEach(r=> csv+=`Heart Rate,${r.value},${r.time}\n`);

  let blob = new Blob([csv],{type:"text/csv"});
  let url = URL.createObjectURL(blob);
  let a=document.createElement("a"); a.href=url; a.download="health_history.csv"; a.click();
  URL.revokeObjectURL(url);
};
