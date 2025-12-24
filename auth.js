function signup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  if (!email || !pass) {
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem("user", JSON.stringify({
    email,
    created: new Date()
  }));

  alert("Account created successfully!");
  window.location.href = "dashboard.html";
}
