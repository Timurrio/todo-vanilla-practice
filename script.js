
const STORAGE_KEY = "todos";
let todos = [];
let filteredTodos = [];

const list = document.getElementById("todoList")
const activeLeft = document.querySelector(".todolist-filters__active-left");

let currentFilter = "all"; 
const filterButtons = document.querySelectorAll(".filter-btn");

const clearCompletedButton = document.querySelector(".todoList-filter__clear-completed")

const input = document.getElementById("inputTodo")

const toggleAllLabel = document.getElementById("toggleAllLabel")
const toggleAll = document.getElementById("toggleAll")


// FUNCTIONS 

function renderInitialLayout() {
  // INITIAL LAYOUT DETAILS
}

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if(data) {
      return JSON.parse(data)
    } else {
      return []
    }
  } catch (e) {
    console.error("Error reading todos from localStorage", e);
    return [];
  }
}

function removeCompleted() {
    todos = todos.filter( (todo) => todo.completed === false)
    saveTodos(todos)
    renderTodos()
}



function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}


function updateActiveCount() {
  const activeCount = todos.filter(todo => !todo.completed).length;
  activeLeft.textContent = activeCount === 1 
    ? `${activeCount} task left` 
    : `${activeCount} tasks left`;
}

function updateToggleAllVisibility() {
  if(filteredTodos.length > 0) {
    toggleAllLabel.style.display = "block"
  } else {
    toggleAllLabel.style.display = "none"
  }
}

function createTodoElements() {
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
    checkmark.className = "todo-checkmark";

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

  
    span.addEventListener("dblclick", () => {
      const todoEdit = document.createElement("input")
      todoEdit.type = "text"
      todoEdit.className = "todo-edit"
      todoEdit.value = todo.text

      btn.style.display = "none"
      label.style.display = "none"

      li.replaceChild(todoEdit, span);
      todoEdit.focus();

      todoEdit.addEventListener("blur", () => {
        todo.text = todoEdit.value.trim() || todo.text;
        btn.style.display = "block"
        label.style.display = "block"
        saveTodos(todos)
        renderTodos()
      })

      todoEdit.addEventListener("keydown", (e) => {
        if(e.key === "Enter") {
          todoEdit.blur();
        }
      })

    })

    li.appendChild(label);
    li.appendChild(span);
    li.appendChild(btn);

    list.appendChild(li);
  });
}

function filterTodos() {
  if(currentFilter === "all") {
    filteredTodos = todos
  } else if (currentFilter === "active") {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter(todo => todo.completed);
  }
}

// RENDER TODOS 

function renderTodos() {
  list.innerHTML = "";

  filterTodos();
  createTodoElements();


  updateToggleAllVisibility();
  updateActiveCount();
}




// LISTENERS 

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

clearCompletedButton.addEventListener("click", () => removeCompleted())

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    renderTodos();
  });
});

toggleAll.addEventListener("change", () => {
  const markAs = toggleAll.checked;
  todos.forEach( (todo) => {
    if(filteredTodos.some(f => f.id === todo.id)){
      todo.completed = markAs
    }
  })

  saveTodos(todos)
  renderTodos()
})


// INIT TODOS
renderInitialLayout();
todos = loadTodos();
renderTodos();