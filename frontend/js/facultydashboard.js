
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    alert("Please login first!");
    window.location.href = "signin.html";
  } else {
    // Prevent students from accessing this page
    if (user.role !== "faculty") {
      alert("Unauthorized: Redirecting to student dashboard.");
      window.location.href = "index.html";
    }

    // Update UI
    document.querySelectorAll(".username-placeholder").forEach(el => {
      el.textContent = user.name;
    });

    document.querySelectorAll(".userrole-placeholder").forEach(el => {
      el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "signin.html";
  }
  document.addEventListener("DOMContentLoaded", () => {
    loadFacultySchedule();
  });
  
  async function loadFacultySchedule() {
    const token = localStorage.getItem("token");
    const tbody = document.getElementById("faculty-schedule");
  
    try {
      const res = await fetch("https://intranet-portal.onrender.com/api/faculty/schedule/today", {
        headers: {
          Authorization: "Bearer " + token
        }
      });
  
      const data = await res.json();
      console.log("✅ Fetched from API:", data);
      tbody.innerHTML = "";
  
      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No classes scheduled today.</td></tr>`;
        return;
      }
  
      data.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${entry.time}</td>
          <td>${entry.subject}</td>
          <td>${entry.classroom}</td>
          <td>${entry.branch} - ${entry.year}</td>
          <td><a class="btn btn-sm btn-primary" href="attendance.html?subject=${encodeURIComponent(entry.subject)}&time=${encodeURIComponent(entry.time)}&classroom=${encodeURIComponent(entry.classroom)}&branch=${encodeURIComponent(entry.branch)}&year=${encodeURIComponent(entry.year)}">
            Take Attendance</a></td>
          `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("❌ Faculty Schedule Load Error:", err);
      tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error loading schedule.</td></tr>`;
    }
  }
  
  // Call function when page loads
  loadFacultySchedule();
  