const SESSION_KEY = 'ht_session';
const USER_DATA_KEY = 'ht_user_data';

function $(id){ return document.getElementById(id); }
function getSession(){ return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
function loadUserData(email){ const blob = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}'); return blob[email] || { profile: {}, readings: {}, suggestions: [] }; }
function saveUserData(email,data){ const blob = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}'); blob[email]=data; localStorage.setItem(USER_DATA_KEY, JSON.stringify(blob)); }

const session = getSession();
if(!session || !session.email) location.href = "index.html";
const email = session.email;
let userData = loadUserData(email);

function renderProfile(){
  const info = userData.profile || {};
  $('profileInfo').innerHTML = `
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Name:</strong> ${info.name || '---'}</p>
    <p><strong>Age:</strong> ${info.age || '---'}</p>
    <p><strong>Gender:</strong> ${info.gender || '---'}</p>
  `;
}
renderProfile();

function createChart(ctx,label,color){
  return new Chart(ctx,{type:'line',data:{labels:[],datasets:[{label,data:[],borderColor:color,fill:false}]},options:{responsive:true,scales:{x:{display:true},y:{display:true}}}});
}

const charts={
  glucose:createChart($("glucoseChart"),"Glucose","red"),
  bp:createChart($("bpChart"),"BP Systolic","blue"),
  temp:createChart($("tempChart"),"Temp","orange"),
  heart:createChart($("heartChart"),"Heart Rate","green"),
  steps:createChart($("stepsChart"),"Steps","purple")
};

function addHistory(type,value){
  const now=new Date().toLocaleTimeString();
  if(!userData.readings[type]) userData.readings[type]=[];
  userData.readings[type].push({time:now,value});
  if(userData.readings[type].length>100) userData.readings[type].shift();
  saveUserData(email,userData);
  $(type+"History").innerHTML=userData.readings[type].map(r=>`<li>${r.time}: ${r.value}</li>`).join("");
}

function updateSuggestions(){
  const suggestions=[];
  const g=userData.readings.glucose?.slice(-1)[0];
  if(g){ if(g.value>180) suggestions.push("⚠️ High glucose. Walk 20–30 mins."); else if(g.value<70) suggestions.push("⚠️ Low glucose. Eat a snack."); else suggestions.push("✅ Glucose normal."); }
  const h=userData.readings.heart?.slice(-1)[0];
  if(h && h.value>100) suggestions.push("⚠️ High heart rate. Relax.");
  $("suggestionList").innerHTML=suggestions.map(s=>`<li>${s}</li>`).join("");
  userData.suggestions=suggestions; saveUserData(email,userData);
}

function updateReading(type,value){
  if(type==="bp") $("bpValue").textContent=value; else $(type+"Value").textContent=value;
  addHistory(type,value);
  const chart=charts[type];
  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(value.includes?parseInt(value.split("/")[0]):value);
  if(chart.data.labels.length>20){chart.data.labels.shift();chart.data.datasets[0].data.shift();}
  chart.update();
  updateSuggestions();
  if(type==="glucose"&&(value>180||value<70)) $("alertSound").play();
}

// Simulated readings
setInterval(()=>{
  updateReading("glucose",Math.floor(Math.random()*100)+70);
  updateReading("bp",`${100+Math.floor(Math.random()*30)}/${70+Math.floor(Math.random()*20)}`);
  updateReading("temp",(36+Math.random()*1.5).toFixed(1));
  updateReading("heart",60+Math.floor(Math.random()*40));
  updateReading("steps",Math.floor(Math.random()*5000));
},5000);

$("logoutBtn").onclick=()=>{localStorage.removeItem(SESSION_KEY);location.href="index.html";};
