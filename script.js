function createHeader() {
  const header = document.createElement("header");
  header.className = "header";

  const h1 = document.createElement("h1");
  h1.className = "header__main-header";
  h1.textContent = "todos";

  header.appendChild(h1);
  return header
}

function createTodoForm(){
  const form = document.createElement("form");
  form.id = "todoForm";
  form.className = "todo-form";

  const label = document.createElement("label");
  label.id = "toggleAllLabel";
  label.className = "toggle-all-wrapper";

  const toggleAllInput = document.createElement("input");
  toggleAllInput.type = "checkbox";
  toggleAllInput.id = "toggleAll";
  toggleAllInput.className = "toggle-all";

  const toggleAllSpan = document.createElement("span");
  toggleAllSpan.className = "toggle-all-checkmark";

  label.append(toggleAllInput, toggleAllSpan);

  const inputTodo = document.createElement("input");
  inputTodo.id = "inputTodo";
  inputTodo.className = "input-todo";
  inputTodo.type = "text";
  inputTodo.placeholder = "What needs to be done?";

  form.append(label, inputTodo);
  return form
}

function createTodoList(){
  const todoList = document.createElement("ul");
  todoList.id = "todoList";
  todoList.className = "todo-list";

  return todoList
}

function createTodoListFooter(){
  const filtersDiv = document.createElement("div");
  filtersDiv.className = "todoList-filters";

  const pActiveLeft = document.createElement("p");
  pActiveLeft.className = "todolist-filters__active-left";

  const tabsDiv = document.createElement("div");
  tabsDiv.className = "todoList-filter__tabs";

  const btnAll = document.createElement("button");
  btnAll.dataset.filter = "all";
  btnAll.className = "filter-btn active";
  btnAll.textContent = "All";

  const btnActive = document.createElement("button");
  btnActive.dataset.filter = "active";
  btnActive.className = "filter-btn";
  btnActive.textContent = "Active";

  const btnCompleted = document.createElement("button");
  btnCompleted.dataset.filter = "completed";
  btnCompleted.className = "filter-btn";
  btnCompleted.textContent = "Completed";

  tabsDiv.append(btnAll, btnActive, btnCompleted);

  const clearBtn = document.createElement("button");
  clearBtn.className = "todoList-filter__clear-completed";
  clearBtn.textContent = "Clear completed";

  filtersDiv.append(pActiveLeft, tabsDiv, clearBtn);

  return filtersDiv
}

function createMain(){
  const main = document.createElement("main");
  main.className = "main";

  const form = createTodoForm()
  const todoList = createTodoList()
  const todoListFooter = createTodoListFooter()

  main.append(form, todoList, todoListFooter);


  return main
}

function createFooter(){
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.textContent = "Simple footer";

  return footer
}


// RENDER INITIAL LAYOUT

function renderInitialLayout() {

  const header = createHeader()
  const main = createMain()
  const footer = createFooter()
  console.log("renderInitialLayout")
  root.append(header, main, footer);
}

const root = document.getElementById("root");
renderInitialLayout();


// Query DOM Elements

const STORAGE_KEY = "todos";
let todos = [];
let filteredTodos = [];

const list = document.getElementById("todoList")
const activeLeft = document.querySelector(".todolist-filters__active-left");

let currentFilter = "all"; 
const filterButtons = document.querySelectorAll(".filter-btn");

const clearCompletedButton = document.querySelector(".todoList-filter__clear-completed")

const input = document.getElementById("inputTodo")
const todoForm = document.getElementById("todoForm")

const toggleAllLabel = document.getElementById("toggleAllLabel")
const toggleAll = document.getElementById("toggleAll")


// FUNCTIONS 



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

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function toggleAllTodos(){
  const markAs = toggleAll.checked;
  todos.forEach( (todo) => {
    if(filteredTodos.some(f => f.id === todo.id)){
      todo.completed = markAs
    }
  })

  saveTodos(todos)
  renderTodos()
}

function changeTodoFilter(btn) {
  currentFilter = btn.dataset.filter;

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    renderTodos();
}

function addNewTodo(){
   if(input.value.trim() !== "") {
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
}

function removeCompletedTodoItems() {
    todos = todos.filter( (todo) => todo.completed === false)
    saveTodos(todos)
    renderTodos()
}

function updateActiveTodoCount() {
  const activeCount = todos.filter(todo => !todo.completed).length;
  activeLeft.textContent = activeCount === 1 
    ? `${activeCount} task left` 
    : `${activeCount} tasks left`;
}

function updateToggleAllButtonVisibility() {
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


  updateToggleAllButtonVisibility();
  updateActiveTodoCount();
}


// LISTENERS 


todoForm.addEventListener("submit", (e) => {
  e.preventDefault()
  addNewTodo()
})

clearCompletedButton.addEventListener("click", () => removeCompletedTodoItems())

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    changeTodoFilter(btn)
  });
});

toggleAll.addEventListener("change", () => {
  toggleAllTodos()
})

// INIT TODOS и
todos = loadTodos();
renderTodos();