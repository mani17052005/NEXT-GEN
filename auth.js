const USERS = 'ht_users';
const SESSION = 'ht_session';
const DATA = 'ht_data';

const $ = id => document.getElementById(id);

async function hash(p){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(p));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function users(){ return JSON.parse(localStorage.getItem(USERS)||'[]'); }
function saveUsers(u){ localStorage.setItem(USERS, JSON.stringify(u)); }

$('showSignup').onclick = ()=>{ $('loginForm').classList.add('hidden'); $('signupForm').classList.remove('hidden'); };
$('showLogin').onclick = ()=>{ $('signupForm').classList.add('hidden'); $('loginForm').classList.remove('hidden'); };

$('signupBtn').onclick = async ()=>{
  const email = signupEmail.value.toLowerCase();
  const pwd = signupPassword.value;
  if(!email||!pwd) return alert("Fill all fields");
  const u = users();
  if(u.find(x=>x.email===email)) return alert("User exists");
  u.push({email,pass:await hash(pwd)});
  saveUsers(u);
  alert("Account created");
  $('showLogin').click();
};

$('loginBtn').onclick = async ()=>{
  const email = loginEmail.value.toLowerCase();
  const pwd = loginPassword.value;
  const u = users().find(x=>x.email===email);
  if(!u || u.pass!==await hash(pwd)) return alert("Invalid login");
  localStorage.setItem(SESSION, JSON.stringify({email}));
  location.href="dashboard.html";
};
