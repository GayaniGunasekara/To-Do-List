// Load tasks from localStorage or initialize with an empty array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggedIndex = null; // For tracking drag-and-drop order

// Render all tasks into the UI
function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = ""; // Clear existing list

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.draggable = true; // Enable drag
    li.dataset.index = index;

    // Display task title, category, and optional due date
    const text = document.createElement("span");
    text.innerHTML = `<strong>${task.title}</strong> (${task.category}) 
      ${task.dueDate ? `<br/><small>Due: ${new Date(task.dueDate).toLocaleString()}</small>` : ''}`;
    li.appendChild(text);

    // ✏️ Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editTask(index);
    li.appendChild(editBtn);

    // 🗑️ Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = () => deleteTask(index);
    li.appendChild(deleteBtn);

    // Handle drag-and-drop
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);

    list.appendChild(li);
  });
}

// Add new task to the list
function addTask() {
  const title = document.getElementById("taskInput").value;
  const category = document.getElementById("categoryInput").value;
  const dueDate = document.getElementById("dueDateInput").value;

  if (!title.trim()) return; // Ignore empty tasks

  tasks.push({ title, category, dueDate, notified: false });
  saveAndRender();
}

// Edit an existing task
function editTask(index) {
  const newTitle = prompt("Edit task", tasks[index].title);
  const newCategory = prompt("Edit category", tasks[index].category);
  const newDueDate = prompt("Edit due date (YYYY-MM-DD HH:MM)", tasks[index].dueDate || "");

  if (newTitle) {
    tasks[index].title = newTitle;
    tasks[index].category = newCategory || "";
    tasks[index].dueDate = newDueDate || null;
    tasks[index].notified = false; // Reset notification flag
    saveAndRender();
  }
}

// Delete a task
function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveAndRender();
  }
}

// Save task list and re-render UI
function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// Drag start: store index of dragged item
function handleDragStart(e) {
  draggedIndex = +this.dataset.index;
  e.dataTransfer.effectAllowed = "move";
}

// Allow drop by preventing default behavior
function handleDragOver(e) {
  e.preventDefault();
}

// Drop: reorder tasks based on drag-and-drop
function handleDrop(e) {
  const targetIndex = +this.dataset.index;
  if (draggedIndex === targetIndex) return;

  const draggedItem = tasks[draggedIndex];
  tasks.splice(draggedIndex, 1);
  tasks.splice(targetIndex, 0, draggedItem);
  saveAndRender();
}

// Toggle dark mode class on body and store preference
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

// Notify user of tasks due in the next 60 seconds
function notifyDueTasks() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const now = new Date().getTime();
  tasks.forEach(task => {
    if (
      task.dueDate &&
      !task.notified &&
      new Date(task.dueDate).getTime() - now < 60000 && // due in 60s
      new Date(task.dueDate).getTime() - now > 0
    ) {
      new Notification("⏰ Task Reminder", {
        body: `${task.title} is due soon!`,
      });
      task.notified = true; // Avoid multiple notifications
    }
  });

  localStorage.setItem("tasks", JSON.stringify(tasks)); // Update storage with notification flags
}

// Check due tasks every 30 seconds
setInterval(notifyDueTasks, 30000);

// Handle mock login
function loginUser() {
  const name = document.getElementById("usernameInput").value;
  if (!name.trim()) return;

  localStorage.setItem("username", name);
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "block";
  renderTasks();
}

// On page load: handle dark mode, check login, and render tasks
window.onload = () => {
  const user = localStorage.getItem("username");
  if (user) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
  }

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  renderTasks();
};
