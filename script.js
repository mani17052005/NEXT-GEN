const USERS_KEY = "ht_users";
const SESSION_KEY = "ht_session";

function loadUsers(){
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toggleForm(mode){
  document.getElementById("signupForm").style.display = mode === "signup" ? "block" : "none";
  document.getElementById("loginForm").style.display = mode === "login" ? "block" : "none";
}

// Signup
document.getElementById("signupForm").addEventListener("submit", e => {
  e.preventDefault();
  const users = loadUsers();
  const user = {
    username: signupUser.value,
    password: signupPass.value,
    age: signupAge.value,
    gender: signupGender.value,
    condition: signupCondition.value,
    readings: []
  };

  if(users.some(u => u.username === user.username)){
    alert("User already exists!");
    return;
  }

  users.push(user);
  saveUsers(users);
  alert("Account created! Please login.");
  toggleForm("login");
});

// Login
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const users = loadUsers();
  const u = loginUser.value, p = loginPass.value;
  const user = users.find(x => x.username === u && x.password === p);
  if(!user){
    alert("Invalid login!");
    return;
  }
  localStorage.setItem(SESSION_KEY, user.username);
  window.location = "dashboard.html";
});
