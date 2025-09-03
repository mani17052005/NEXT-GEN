// ================= Utilities =================
const USERS_KEY = 'ht_users';
const SESSION_KEY = 'ht_session';
const USERDATA_KEY = 'ht_user_data';

const $ = (id) => document.getElementById(id);

// Toggle between login/signup forms
function toggleForm(mode) {
  $('signupForm').style.display = mode === 'login' ? 'none' : 'block';
  $('loginForm').style.display  = mode === 'login' ? 'block' : 'none';
}

// Secure password hashing (SHA-256)
async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// LocalStorage helpers
function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function setSession(email, remember = true) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now(), remember }));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Initialize user data container
function initUserData(email) {
  const blob = JSON.parse(localStorage.getItem(USERDATA_KEY) || '{}');
  if (!blob[email]) {
    blob[email] = {
      profile: {
        name: "",
        age: "",
        gender: "",
        height: "",
        weight: "",
        stepGoal: 5000, // default daily step goal
      },
      readings: [],      // glucose, BP, etc.
      suggestions: [],   // AI suggestions
      steps: 0           // step counter
    };
    localStorage.setItem(USERDATA_KEY, JSON.stringify(blob));
  }
}

// ================= Sign Up =================
async function signup() {
  const email = $('signupEmail').value.trim().toLowerCase();
  const password = $('signupPassword').value;

  if (!email || !password) return alert('Please fill all fields.');
  const users = loadUsers();
  if (users.some(u => u.email === email)) {
    alert('Account already exists. Please login.');
    toggleForm('login');
    $('loginEmail').value = email;
    return;
  }

  const passHash = await sha256(password);
  users.push({ email, passHash, createdAt: new Date().toISOString() });
  saveUsers(users);

  // create default profile blob for this user
  initUserData(email);

  alert('Account created! You can login now.');
  toggleForm('login');
  $('loginEmail').value = email;
}

// ================= Login =================
async function login() {
  const email = $('loginEmail').value.trim().toLowerCase();
  const password = $('loginPassword').value;
  if (!email || !password) return alert('Enter email and password.');

  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return alert('No account found. Please sign up.');

  const passHash = await sha256(password);
  if (passHash !== user.passHash) return alert('Incorrect password.');

  setSession(email, $('rememberMe').checked);
  location.href = 'dashboard.html';
}

// ================= Logout (for dashboard) =================
function logout() {
  clearSession();
  location.href = 'index.html';
}

// ================= Init =================
(function init() {
  const session = getSession();
  if (session && session.email && window.location.pathname.includes("index.html")) {
    // auto redirect to dashboard if already logged in
    location.href = 'dashboard.html';
    return;
  }

  if ($('signupBtn')) $('signupBtn').onclick = signup;
  if ($('loginBtn')) $('loginBtn').onclick = login;
  if ($('goLogin')) $('goLogin').onclick = e => { e.preventDefault(); toggleForm('login'); };
  if ($('goSignup')) $('goSignup').onclick = e => { e.preventDefault(); toggleForm('signup'); };
})();
