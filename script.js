const USERS_KEY = 'ht_users';
const SESSION_KEY = 'ht_session';

const $ = (id) => document.getElementById(id);

function toggleForm(mode){
  $('signupForm').style.display = mode === 'login' ? 'none' : 'block';
  $('loginForm').style.display  = mode === 'login' ? 'block' : 'none';
}

// SHA-256 password hashing
async function sha256(text){
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

function loadUsers(){
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(email, remember){
  const sessionData = { email, ts: Date.now() };
  if (remember){
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
}
function getSession(){
  return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || 'null');
}

async function signup(){
  const email = $('signupEmail').value.trim().toLowerCase();
  const password = $('signupPassword').value;

  if(!email || !password){ alert("Please fill all fields"); return; }

  let users = loadUsers();
  if(users.find(u => u.email === email)){
    alert("Account already exists. Please login.");
    toggleForm('login');
    $('loginEmail').value = email;
    return;
  }

  const passHash = await sha256(password);
  users.push({email, passHash});
  saveUsers(users);
  alert("Signup successful! You can login now.");
  toggleForm('login');
  $('loginEmail').value = email;
}

async function login(){
  const email = $('loginEmail').value.trim().toLowerCase();
  const password = $('loginPassword').value;

  if(!email || !password){ alert("Enter email and password."); return; }

  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if(!user){ alert("No such account. Please sign up."); return; }

  const passHash = await sha256(password);
  if(passHash !== user.passHash){ alert("Incorrect password."); return; }

  setSession(email, $('rememberMe').checked);
  location.href = 'dashboard.html';
}

// Attach events
window.onload = () => {
  if(getSession()?.email){
    location.href = 'dashboard.html';
    return;
  }
  $('signupBtn').onclick = signup;
  $('loginBtn').onclick = login;
  $('goLogin').onclick = e => { e.preventDefault(); toggleForm('login'); };
  $('goSignup').onclick = e => { e.preventDefault(); toggleForm('signup'); };
};
