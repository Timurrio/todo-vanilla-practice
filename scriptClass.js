function loadTodos() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    return data
  } catch (e) {
    console.error("Error reading todos from localStorage", e);
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}



class App {
    constructor(todoList, root){
        this.todoList = todoList
        this.root = root
    }

    render(){
        //RENDER DOM
    }
}

class Todo {
    constructor(text){
        this.id = Date.now().toString();
        this.text = text;
        this.completed = false;
    }

    toggle(){
        //toggle logic
    }

    editText(){
        //edit text logic
    }
}

class TodoList {
    constructor(todos=[]){
        this.todos = todos
    }

    add(){
        //add logic
    }

    remove(){
        //remove logic
    }

    toggle(){
        //toggle logic
    }
}


// INIT

const root = document.getElementById("root")
const todoList = new TodoList()
const app = new App(todoList, root)
app.render()