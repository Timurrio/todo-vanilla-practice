class Todo {
  constructor(text, completed = false) {
    this.id = Date.now().toString();
    this.text = text;
    this.completed = completed;
  }

  toggle() {
    this.completed = !this.completed;
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      completed: this.completed,
    };
  }

}


// Local Storage Logic

const STORAGE_KEY = "todos";

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading todos from localStorage", e);
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

let todos = loadTodos();


// DOM Todo Logic

const list = document.getElementById("todoList")
const activeLeft = document.querySelector(".todolist-filters__active-left");

function updateActiveCount() {
  const activeCount = todos.filter(todo => !todo.completed).length;
  activeLeft.textContent = activeCount === 1 
    ? `${activeCount} task left` 
    : `${activeCount} tasks left`;
}

let currentFilter = "all"; 

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    renderTodos();
  });
});

function renderTodos() {
  list.innerHTML = "";

  let filteredTodos = todos;
  if (currentFilter === "active") {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter(todo => todo.completed);
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement("li");
    li.dataset.id = todo.id;
    li.className = "todo-item";
    if (todo.completed) li.classList.add("completed");

    const label = document.createElement("label");
    label.className = "todo-checkbox-wrapper";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos(todos);
      renderTodos();
    });

    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";

    label.appendChild(checkbox);
    label.appendChild(checkmark);

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;

    const btn = document.createElement("button");
    btn.className = "todo-delete";
    btn.textContent = "X";
    btn.addEventListener("click", () => {
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos(todos);
      renderTodos();
    });

    li.appendChild(label);
    li.appendChild(span);
    li.appendChild(btn);

    list.appendChild(li);
  });

  updateActiveCount();
}

// TODO INPUT LOGIC

const input = document.getElementById("inputTodo")

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && input.value.trim() !== "") {
    const newTodo = {
      id: Date.now().toString(), 
      text: input.value.trim(),
      completed: false
    };

    todos.push(newTodo);       
    saveTodos(todos);          
    renderTodos();             
    input.value = "";          
  }
});


// Clear Completed Button

const clearCompletedButton = document.querySelector(".todoList-filter__clear-completed")

function removeCompleted() {
    todos = todos.filter( (todo) => todo.completed === false)
    saveTodos(todos)
    renderTodos()
}

clearCompletedButton.addEventListener("click", () => removeCompleted())




// INIT TODOS
renderTodos();