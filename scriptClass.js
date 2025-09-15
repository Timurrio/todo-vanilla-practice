function createHeader() {
  const header = document.createElement("header");
  header.className = "header";

  const h1 = document.createElement("h1");
  h1.className = "header__main-header";
  h1.textContent = "todos";

  header.appendChild(h1);
  return header
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

function createMain(form){
  const main = document.createElement("main");
  main.className = "main";

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

function renderInitialLayout(root, form) {

  const header = createHeader()
  const main = createMain(form)
  const footer = createFooter()
  root.append(header, main, footer);
}


// LOCAL STORAGE LOGIC

const STORAGE_KEY = "todos"




// CLASSES

class Form {
    constructor(){
        const formElements = this.createFormElements()
        this.form = formElements.formElement
        this.input = formElements.inputElement
        this.toggleAll = formElements.toggleAllElement
    }

    createFormElements(){
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
        return {formElement: form, inputElement: inputTodo, toggleAllElement: toggleAllInput}
    }
}


class App {
    constructor(root){
        this.todoList = new TodoList()
        this.todoList._todos = TodoService.getTodos(this.todoList)
        this.root = root

        this.todoForm = new Form()
        

    }

    handleTodoFormSubmit(e){
        e.preventDefault()
        this.todoList.addTodo(this.todoForm.input.value.trim())
        this.todoForm.input.value = ""
    }

    handleChangeTodoFilter(btn){
        this.todoList.currentFilter = btn.dataset.filter;

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        this.todoList.render()
    }

    handleClearCompletedTodos(){
        this.todoList.todos = this.todoList.todos.filter( (todo) => todo.completed === false)
    }

    init(){
        renderInitialLayout(this.root, this.todoForm.form)
        
        this.todoForm.form.addEventListener("submit", (e) => this.handleTodoFormSubmit(e))

        this.todoList.root = document.getElementById("todoList")
        this.todoList.activeTodoAmount = document.querySelector(".todolist-filters__active-amount")

        this.todoList.toggleAllLabel = document.getElementById("toggleAllLabel")
        this.todoList.toggleAll = document.getElementById("toggleAll")
        this.todoList.toggleAll.addEventListener("change", this.todoList.toggleAllTodos.bind(this.todoList))



        const filterButtons = document.querySelectorAll(".filter-btn");
        filterButtons.forEach(btn => btn.addEventListener("click", (btn) => this.handleChangeTodoFilter(btn)));

        const clearCompletedButton = document.querySelector(".todoList-filter__clear-completed")

        clearCompletedButton.addEventListener("click", this.handleClearCompletedTodos)


        this.todoList.render()
    }


}

class TodoService {
    static getTodos(todoList) {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
            const todos = data.map((todo) => new TodoItem(todo.id, todo.text, todo.completed, todoList))
            return todos
        } catch (e) {
            console.error("Error reading todos from localStorage", e);
            return [];
        }
    }


    static setTodos(todos) {
        const data = todos.map((todo) => ({id: todo.id, text: todo.text, completed: todo.completed}))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

}


class TodoItem {
    constructor(id = Date.now().toString(), text, completed = false, todoList){
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.todoList = todoList
    }

    toggle(){
        this.completed = !this.completed
        this.todoList.updateTodo(this)
        
    }

    editText(newText){
            this.text = newText
            this.todoList.updateTodo(this)
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
            this.todoList.removeTodo(this)
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
            const newText = todoEdit.value.trim()
            if(newText){
                this.editText(newText)
            } else {
                this.editText(this.text)
            }
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

        this._todos = todos
        this.filteredTodos = todos
        this.currentFilter = "all"
        this.root = null
        this.activeTodoAmount = null
        this.toggleAll = null 
        this.toggleAllLabel = null
        
    }

    set todos(value){
        this._todos = value
        TodoService.setTodos(value)
        this.render()
    }

    get todos(){
        return this._todos
    }

    updateToggleAllButtonVisibility() {
        if(this.filteredTodos.length > 0) {
            this.toggleAllLabel.style.display = "block"
        } else {
            this.toggleAllLabel.style.display = "none"
        }
    }

    updateActiveTodoCount() {
        
        const activeCount = this.todos.filter(todo => !todo.completed).length;
        this.activeTodoAmount.textContent = activeCount === 1 
            ? `${activeCount} task left` 
            : `${activeCount} tasks left`;
    }

    toggleAllTodos() {
        const markAs = this.toggleAll.checked;

        const newTodos = this.todos.map( (todo) => {
            if(this.filteredTodos.some(f => f.id === todo.id)){
                return new TodoItem(todo.id, todo.text, markAs, this)
            } else {
              return todo
            }
        })

        this.todos = newTodos
    }


    updateTodo(todo){
        this.todos = this.todos.map( (td) => td.id === todo.id ? todo : td)
    }

    removeTodo(todo){
        this.todos = this.todos.filter( td => td.id !== todo.id)
    }

    filterTodoList(){
         if(this.currentFilter === "all") {

            this.filteredTodos = this.todos

            if(this.filteredTodos.some( (todo) => todo.completed === false))
                {
                 this.toggleAll.checked = false
                } else {
                 this.toggleAll.checked = true
                }

        } else if (this.currentFilter === "active") {
            this.filteredTodos = this.todos.filter(todo => !todo.completed);
            this.toggleAll.checked = false
        } else if (this.currentFilter === "completed") {
            this.filteredTodos = this.todos.filter(todo => todo.completed);
            this.toggleAll.checked = true

        } else {
            this.filteredTodos = []
        }
    }

    render(){
        this.root.innerHTML = ""

        
        this.filterTodoList()

        const domTodos = this.filteredTodos.map( (todo) => todo.createTodoItemElement(() => this.render()))
        domTodos.forEach( (todo) => {
            this.root.appendChild(todo)
        })

        this.updateActiveTodoCount();
        this.updateToggleAllButtonVisibility();
    }

    addTodo(text){
        const newTodo = new TodoItem(undefined,text, false, this)
        this.todos = [...this.todos,newTodo]
    }

    remove(todoId){
        this.todos = this.todos.filter( (todo) => todo.id !== todoId)
    }

}


// INIT

const root = document.getElementById("root")
const app = new App(root)
app.init()

