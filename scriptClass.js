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

  const activeTodosAmount = document.createElement("p");
  activeTodosAmount.className = "todolist-filters__active-amount";

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

  filtersDiv.append(activeTodosAmount, tabsDiv, clearBtn);

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

function renderInitialLayout(root) {

  const header = createHeader()
  const main = createMain()
  const footer = createFooter()
  root.append(header, main, footer);
}


// LOCAL STORAGE LOGIC

const STORAGE_KEY = "todos"

function getTodos() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    const dataTodos = data.map((todo) => new TodoItem(todo.id, todo.text, todo.completed))
    return dataTodos
  } catch (e) {
    console.error("Error reading todos from localStorage", e);
    return [];
  }
}

function setTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}


// CLASSES

class App {
    constructor(root){
        this.todoList = new TodoList(getTodos())
        this.root = root
    }

    init(){
        renderInitialLayout(this.root)
        this.todoList.root = document.getElementById("todoList")
        this.todoList.render()

    }

    render(){
        //RENDER DOM

    }
}



class TodoItem {
    constructor(id = Date.now().toString(), text, completed = false){
        this.id = id;
        this.text = text;
        this.completed = completed;
    }

    toggle(renderTodoList){
        this.completed = !this.completed
        const newTodos = getTodos().map( (td) => {
        if(td.id === this.id){
          return this
        } else {
          return td
        }
        })
        setTodos(newTodos);
        renderTodoList();
        
    }

    editText(newText){
        if(newText){
            this.text = newText
        }
    }

    createTodoItemElement(renderTodoList){    
        const li = document.createElement("li");
        li.dataset.id = this.id;
        li.className = "todo-item";
        if (this.completed) li.classList.add("completed");

        const label = document.createElement("label");
        label.className = "todo-checkbox-wrapper";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.checked = this.completed;
        checkbox.addEventListener("change", () => {
            this.toggle(renderTodoList)
        });

        const checkmark = document.createElement("span");
        checkmark.className = "todo-checkmark";

        label.appendChild(checkbox);
        label.appendChild(checkmark);

        const todoText = document.createElement("span");
        todoText.className = "todo-text";
        todoText.textContent = this.text;

        const btn = document.createElement("button");
        btn.className = "todo-delete";
        btn.textContent = "X";

        btn.addEventListener("click", () => {
             const newTodos = getTodos().filter(t => t.id !== this.id);
             setTodos(newTodos);
             renderTodoList();
        });

    
        todoText.addEventListener("dblclick", () => {
        const todoEdit = document.createElement("input")
        todoEdit.type = "text"
        todoEdit.className = "todo-edit"
        todoEdit.value = this.text

        btn.style.display = "none"
        label.style.display = "none"

        li.replaceChild(todoEdit, todoText);
        todoEdit.focus();

        todoEdit.addEventListener("blur", () => {

            btn.style.display = "block"
            label.style.display = "block"

            const newTodos = getTodos().map( (td) => {
            if(td.id === this.id){
                return new TodoItem(td.id , todoEdit.value.trim() || this.text, td.completed)
            } else {
                return td
            }
            })
            setTodos(newTodos)
            renderTodoList()
        })
        
        todoEdit.addEventListener("keydown", (e) => {
            if(e.key === "Enter") {
            todoEdit.blur();
            }
        })
        })

        
        li.appendChild(label);
        li.appendChild(todoText);
        li.appendChild(btn);

        return li
    }
}

class TodoList {
    constructor(todos=[]){

        // let todoList = todos.map( (todo) => {
        //     return new TodoItem(todo.id, todo.text, todo.completed)
        // })

        this._todos = todos
        this.filteredTodos = todos
        this.currentFilter = "all"
        this.root = null
    }

    set todos(value){
        this._todos = value
        setTodos(value)
    }

    //TOGGLE ALL FIX
    filterTodoList(){
         if(this.currentFilter === "all") {

            this.filteredTodos = this._todos

            // if(this.filteredTodos.some( (todo) => todo.completed === false))
            //     {
            //     toggleAll.checked = false
            //     } else {
            //     toggleAll.checked = true
            //     }

        } else if (this.currentFilter === "active") {
            this.filteredTodos = this._todos.filter(todo => !todo.completed);
            // toggleAll.checked = false
        } else if (this.currentFilter === "completed") {
            this.filteredTodos = this._todos.filter(todo => todo.completed);
            // toggleAll.checked = true

        } else {
            this.filteredTodos = []
        }
    }

    render(){
        //Move to constructor info about todoList root?
        this.root.innerHTML = ""
        console.log(this._todos)
        console.log(this.filteredTodos)
        this._todos = getTodos()
        console.log("RENDER!")
        
        this.filterTodoList()
        const domTodos = this.filteredTodos.map( (todo) => todo.createTodoItemElement(() => this.render()))
        
        domTodos.forEach( (todo) => {
            this.root.appendChild(todo)
        })

        // this.filteredTodos.forEach(element => {
        //     element.createTodoItemElement()
        // });

        // updateToggleAllButtonVisibility();
        // updateActiveTodoCount(todos);

        // render logic
    }

    addTodo(text){
        const newTodo = new TodoItem(undefined,text)
        this.todos = [...this._todos,newTodo]
        this.render()
        //add logic
    }

    remove(todoId){
        this.todos = this.todos.filter( (todo) => todo.id !== todoId)
        this.render()
        //remove logic
    }

    // toggle(){
    //     //toggle logic
    // }
}


// INIT

// const localStorageTodos = getTodos()
const root = document.getElementById("root")
// const todoList = new TodoList(localStorageTodos)
const app = new App(root)
app.init()
// app.render()
const todoInput = document.getElementById("inputTodo")
todoForm = document.getElementById("todoForm")

todoForm.addEventListener("submit", (e) => {
    e.preventDefault()
    app.todoList.addTodo(todoInput.value.trim())
    todoInput.value = ""
} )

const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach(btn => btn.addEventListener("click", () => {
    app.todoList.currentFilter = btn.dataset.filter;

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    app.todoList.render()
}));

const clearCompletedButton = document.querySelector(".todoList-filter__clear-completed")

clearCompletedButton.addEventListener("click", () => {
    app.todoList.todos = app.todoList._todos.filter( (todo) => todo.completed === false)
    app.todoList.render()
})

