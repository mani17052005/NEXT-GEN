const USERS_KEY = "ht_users";
const SESSION_KEY = "ht_session";

const $ = id => document.getElementById(id);

function toggleForm(mode) {
  $("signupForm").style.display = mode === "login" ? "none" : "block";
  $("loginForm").style.display = mode === "login" ? "block" : "none";
}

function loadUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function setSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
}
function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

// Signup
$("signupBtn").onclick = () => {
  const email = $("signupEmail").value.trim();
  const password = $("signupPassword").value;
  if (!email || !password) return alert("Fill all fields");

  let users = loadUsers();
  if (users.find(u => u.email === email)) return alert("User exists");

  users.push({ email, password });
  saveUsers(users);
  alert("Account created!");
  toggleForm("login");
  $("loginEmail").value = email;
};

// Login
$("loginBtn").onclick = () => {
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  let users = loadUsers();
  let user = users.find(u => u.email === email && u.password === password);
  if (!user) return alert("Invalid login");
  setSession(email);
  location.href = "dashboard.html";
};

// Init
$("goLogin").onclick = e => { e.preventDefault(); toggleForm("login"); };
$("goSignup").onclick = e => { e.preventDefault(); toggleForm("signup"); };
