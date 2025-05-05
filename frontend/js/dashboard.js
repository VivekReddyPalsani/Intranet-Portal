// ✅ Auth check & user info
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  alert("Please login first!");
  window.location.href = "signin.html";
} else if (user.role !== "student") {
  window.location.href = "faculty.html";
} else {
  document.querySelectorAll(".username-placeholder").forEach(el => {
    el.textContent = user.name;
  });

  document.querySelectorAll(".userrole-placeholder").forEach(el => {
    el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  });

  fetchTasks();
  loadTodaySchedule(); // call this after fetchTasks() in your dashboard.js
 // Load To-Do tasks
}

// 🔓 Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "signin.html";
}

// 📝 Fetch and render tasks
async function fetchTasks() {
  try {
    const res = await fetch("https://intranet-portal.onrender.com/api/tasks", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const tasks = await res.json();
    if (!Array.isArray(tasks)) {
      console.warn("⚠️ Unexpected response for tasks:", tasks);
      return;
    }

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "list-group-item bg-transparent d-flex align-items-center justify-content-between";

      li.innerHTML = `
        <div>
          <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete('${task._id}')">
          <span class="ms-2 task-text" style="text-decoration: ${task.completed ? 'line-through' : 'none'}; opacity: ${task.completed ? '0.5' : '1'};">
            ${task.text}
          </span>
        </div>
        <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')"><i class="fa fa-times"></i></button>
      `;

      taskList.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Error loading tasks:", err);
  }
}

// ➕ Add new task
async function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) return;

  try {
    await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    input.value = "";
    fetchTasks();
  } catch (err) {
    console.error("❌ Error adding task:", err);
  }
}

// ✅ Toggle task completion
async function toggleComplete(taskId) {
  try {
    await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchTasks();
  } catch (err) {
    console.error("❌ Error toggling task:", err);
  }
}

// ❌ Delete task
async function deleteTask(taskId) {
  try {
    await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchTasks();
  } catch (err) {
    console.error("❌ Error deleting task:", err);
  }
}

async function loadTodaySchedule() {
  try {
    const res = await fetch("http://localhost:5000/api/schedule/today", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    const tbody = document.getElementById("schedule-body");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No classes scheduled today</td></tr>`;
      return;
    }

    const today = new Date().toLocaleDateString('en-GB');

    data.forEach(entry => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${today}</td>
        <td>${entry.time}</td>
        <td>${entry.subject}</td>
        <td>${entry.classroom}</td>
        <td>${entry.facultyName}</td>
        <td>
          <button class="btn btn-sm btn-danger review-btn" data-email="${entry.facultyEmail}" data-subject="${entry.subject}">
            Review
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    document.querySelectorAll(".review-btn").forEach(button => {
      button.addEventListener("click", () => {
        const subject = button.getAttribute("data-subject");
        const faculty = button.getAttribute("data-email");
        document.getElementById("reviewSubject").value = subject;
        document.getElementById("reviewFaculty").value = faculty;
    
        const reviewModal = new bootstrap.Modal(document.getElementById("reviewModal"));
        reviewModal.show();
      });
    });
  } catch (err) {
    console.error("❌ Could not load schedule:", err);
    document.getElementById("schedule-body").innerHTML = `<tr><td colspan="6">Something went wrong</td></tr>`;
  }
}
$(document).ready(function () {
  // When a review button is clicked, populate the modal fields
  $('.review-btn').on('click', function () {
      var subject = $(this).data('subject');
      var faculty = $(this).data('faculty');
      $('#reviewSubject').val(subject);
      $('#reviewFaculty').val(faculty);
      $('#reviewText').val(''); // Clear previous review text
  });

});
// 🧠 Attach Review Button Logic
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("review-btn")) {
    const subject = e.target.getAttribute("data-subject");
    const faculty = e.target.getAttribute("data-faculty");

    // Fill modal fields
    document.getElementById("reviewSubject").value = subject;
    document.getElementById("reviewFaculty").value = faculty;

    // Show the modal using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById("reviewModal"));
    modal.show();
  }
});

