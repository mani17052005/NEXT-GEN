const SESSION_KEY = 'ht_session';
const DATA_KEY = 'ht_user_data';

function getSession(){
  return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || 'null');
}
function clearSession(){
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

const session = getSession();
if(!session?.email){ location.href = 'index.html'; }

const userEmail = session.email;
document.getElementById('userEmail').textContent = userEmail;

// load user data
let data = JSON.parse(localStorage.getItem(DATA_KEY) || '{}');
if(!data[userEmail]) data[userEmail] = { profile:{}, readings:[] };
let userData = data[userEmail];

// populate profile inputs
document.getElementById('userName').value   = userData.profile.name   || "";
document.getElementById('userAge').value    = userData.profile.age    || "";
document.getElementById('userGender').value = userData.profile.gender || "";
document.getElementById('userPref').value   = userData.profile.pref   || "";

// save profile
document.getElementById('saveProfile').onclick = () => {
  userData.profile = {
    name: document.getElementById('userName').value,
    age: document.getElementById('userAge').value,
    gender: document.getElementById('userGender').value,
    pref: document.getElementById('userPref').value
  };
  data[userEmail] = userData;
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  alert("Profile saved!");
};

// logout
document.getElementById('logoutBtn').onclick = () => {
  clearSession();
  location.href = 'index.html';
};

// ---- Chart setup ----
function createChart(ctx,label,color){
  return new Chart(ctx,{
    type:'line',
    data:{labels:[],datasets:[{label:label,data:[],borderColor:color,fill:false}]},
    options:{scales:{x:{display:true},y:{beginAtZero:true}}}
  });
}

const glucoseChart = createChart(document.getElementById('glucoseChart'),"Glucose","red");
const bpChart      = createChart(document.getElementById('bpChart'),"BP","blue");
const tempChart    = createChart(document.getElementById('tempChart'),"Temp","orange");
const hrChart      = createChart(document.getElementById('hrChart'),"Heart Rate","green");

// ---- Simulated readings ----
function random(min,max){ return Math.round(Math.random()*(max-min)+min); }

function updateReadings(){
  const now = new Date().toLocaleTimeString();
  const reading = {
    time: now,
    glucose: random(60,180),
    bp: random(100,140),
    temp: (36+Math.random()*2).toFixed(1),
    hr: random(60,100)
  };
  userData.readings.push(reading);
  if(userData.readings.length>50) userData.readings.shift();

  // save
  data[userEmail] = userData;
  localStorage.setItem(DATA_KEY, JSON.stringify(data));

  // update charts
  function pushData(chart,value){
    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(value);
    if(chart.data.labels.length>20){
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update();
  }
  pushData(glucoseChart,reading.glucose);
  pushData(bpChart,reading.bp);
  pushData(tempChart,reading.temp);
  pushData(hrChart,reading.hr);

  // update history table
  const row = document.createElement("tr");
  row.innerHTML = `<td>${reading.time}</td><td>${reading.glucose}</td><td>${reading.bp}</td><td>${reading.temp}</td><td>${reading.hr}</td>`;
  document.querySelector("#historyTable tbody").appendChild(row);
}

setInterval(updateReadings,5000);
updateReadings();

// ---- Export CSV ----
document.getElementById('exportBtn').onclick = () => {
  let csv = "Time,Glucose,BP,Temp,HR\n";
  userData.readings.forEach(r=>{
    csv += `${r.time},${r.glucose},${r.bp},${r.temp},${r.hr}\n`;
  });
  const blob = new Blob([csv],{type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "readings.csv";
  a.click();
  URL.revokeObjectURL(url);
};
