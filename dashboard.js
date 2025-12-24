const ctx = document.getElementById("healthChart");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["10:30", "10:45", "11:00", "11:15", "11:30"],
    datasets: [
      { label: "Glucose", data: [90, 88, 87, 89, 85], borderColor: "#3b82f6" },
      { label: "Heart Rate", data: [82, 80, 78, 77, 84], borderColor: "#ef4444" },
      { label: "BP Systolic", data: [120, 118, 117, 119, 112], borderColor: "#f59e0b" },
      { label: "Temperature", data: [98, 98.1, 98.2, 98.4, 98.6], borderColor: "#22c55e" }
    ]
  },
  options: {
    responsive: true,
    tension: 0.4
  }
});
