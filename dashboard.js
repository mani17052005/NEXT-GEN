const SESSION='ht_session', DATA='ht_data';
const email = JSON.parse(localStorage.getItem(SESSION))?.email;
if(!email) location.href="index.html";

const blob = JSON.parse(localStorage.getItem(DATA)||'{}');
blob[email]=blob[email]||{readings:[]};
let data = blob[email];

const labels=[], g=[], s=[], d=[], t=[], h=[];

const makeChart=(id,label,arr)=>new Chart(id,{type:'line',
data:{labels,datasets:[{label,data:arr,tension:.3}]}});

const cg=makeChart(gChart,"Glucose",g);
const cbp=new Chart(bpChart,{type:'line',
data:{labels,datasets:[
{label:"Sys",data:s},{label:"Dia",data:d}]}});
const ct=makeChart(tChart,"Temp",t);
const ch=makeChart(hChart,"Heart",h);

function score(x){
 let sc=100;
 if(x.glucose>160||x.glucose<70) sc-=20;
 if(x.bpSys>140||x.bpDia>90) sc-=20;
 if(x.temp>38) sc-=15;
 if(x.heart>110) sc-=15;
 return Math.max(sc,0);
}

function tick(){
 const now=new Date();
 const r={
  time:now.toISOString(),
  glucose:90+Math.random()*60,
  bpSys:110+Math.random()*30,
  bpDia:70+Math.random()*20,
  temp:36+Math.random()*2,
  heart:60+Math.random()*50
 };

 labels.push(now.toLocaleTimeString());
 g.push(r.glucose); s.push(r.bpSys); d.push(r.bpDia);
 t.push(r.temp); h.push(r.heart);

 data.readings.push(r);
 blob[email]=data;
 localStorage.setItem(DATA,JSON.stringify(blob));

 const sc=score(r);
 healthScore.textContent=sc+"/100";
 healthRemark.textContent=sc>80?"Excellent":sc>60?"Good":"Needs Attention";

 suggestions.innerHTML="";
 if(r.glucose>140) suggestions.innerHTML+="<li>⚠️ High glucose</li>";
 if(r.temp>38) suggestions.innerHTML+="<li>🤒 Fever detected</li>";

 trendList.innerHTML="";
 if(g.length>5){
   trendList.innerHTML+=
     g.at(-1)-g.at(-5)>20?
     "<li>📈 Glucose rising</li>":"<li>➡️ Stable</li>";
 }

 cg.update(); cbp.update(); ct.update(); ch.update();
}

setInterval(tick,10000);
