const select = document.getElementById("filter");
const addButton = document.getElementById("add-task-button");
const taskList = document.getElementById("task-list");

function adjustWidth() {
  const option = select.options[select.selectedIndex];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const style = getComputedStyle(select);

  ctx.font = style.font;

  const textWidth = ctx.measureText(option.text).width;
  const extraWidth =
    parseFloat(style.paddingLeft) +
    parseFloat(style.paddingRight) +
    parseFloat(style.borderLeftWidth) +
    parseFloat(style.borderRightWidth) +
    30; // 矢印などの余白

  select.style.width = `${Math.ceil(textWidth + extraWidth)}px`;
}

select.addEventListener("change", adjustWidth);

adjustWidth();

refreshTasks();
addButton.addEventListener("click", () => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container");
  const form = document.createElement("form");
  form.classList.add("task-form");
  form.setAttribute("method", "post");
  form.setAttribute("action", "/api/task/add");
  formContainer.appendChild(form);
  const titleInput = document.createElement("input");
  titleInput.setAttribute("type", "text");
  titleInput.setAttribute("name", "title");
  titleInput.setAttribute("placeholder", "Enter task title");
  form.appendChild(titleInput);
  titleInput.required = true;
  titleInput.focus();
  const descriptionInput = document.createElement("textarea");
  descriptionInput.setAttribute("name", "description");
  descriptionInput.setAttribute("placeholder", "Enter task description");
  form.appendChild(descriptionInput);
  const submitButton = document.createElement("button");
  submitButton.setAttribute("type", "submit");
  submitButton.textContent = "Add Task";
  form.appendChild(submitButton);
  formContainer.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());
    const jsonString = JSON.stringify(dataObject);
    fetch(form.getAttribute("action"), {
      method: "POST",
      body: jsonString,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          formContainer.remove();
          refreshTasks();
        } else {
          console.error("Error adding task");
        }
      })
      .catch((error) => {
        console.error("Error adding task", error);
      });
  });
  document.getElementById("main-container").appendChild(formContainer);
  const closeHundler = (ev) => {
    if (ev.key === "Escape") {
      formContainer.remove();
      document.body.removeEventListener("keydown", this);
    }
  }
  document.body.addEventListener("keydown", (ev) => {
    closeHundler(ev);
  });
});

async function refreshTasks() {
  taskList.innerHTML = "";
  const filterValue = select.value;
  const response = await fetch(`/api/task/list?filter=${filterValue}`);
  const tasks = await response.json();
  tasks.forEach((task) => {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");
    const taskTitle = document.createElement("h3");
    taskTitle.textContent = task.title;
    taskItem.appendChild(taskTitle);
    taskList.appendChild(taskItem);
  });
}