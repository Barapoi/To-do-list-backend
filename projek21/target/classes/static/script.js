// Fetch all todos when the page loads
document.addEventListener('DOMContentLoaded', fetchTodos);

function fetchTodos() {
    fetch('/api/todos')
        .then(response => response.json())
        .then(todos => {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = createTodoItem(todo);
                todoList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching todos:', error));
}

function addTodo() {
    const todoInput = document.getElementById('todoInput');
    const title = todoInput.value.trim();
    if (title) {
        const newTodo = {
            title: title,
            completed: false
        };
        fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTodo)
        })
        .then(response => response.json())
        .then(todo => {
            const todoList = document.getElementById('todoList');
            const li = createTodoItem(todo);
            todoList.appendChild(li);
            todoInput.value = '';
        })
        .catch(error => console.error('Error adding todo:', error));
    }
}

function createTodoItem(todo) {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';
    li.innerHTML = `
        <span onclick="editTodo(${todo.id}, this)" style="cursor: pointer; flex: 1;">
            ${todo.title}
        </span>
        <div class="actions">
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            <button class="edit-btn" onclick="editTodo(${todo.id}, this.parentNode.parentNode.querySelector('span'))">✎ Edit</button>
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleComplete(${todo.id}, this.checked)" class="task-checkbox">
        </div>
    `;
    li.style.transition = 'all 0.3s ease';
    return li;
}

function toggleComplete(id, completed) {
    // Find the todo item in the list to get its current title
    const todoItem = Array.from(document.getElementById('todoList').children)
        .find(item => item.querySelector('span').textContent.trim() === item.querySelector('span').textContent.trim());
    const title = todoItem ? todoItem.querySelector('span').textContent.trim() : '';
    fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title, completed: completed })
    })
    .then(response => response.json())
    .then(() => fetchTodos())
    .catch(error => console.error('Error updating todo:', error));
}

function deleteTodo(id) {
    fetch(`/api/todos/${id}`, {
        method: 'DELETE'
    })
    .then(() => fetchTodos())
    .catch(error => console.error('Error deleting todo:', error));
}

// Allow pressing Enter to add a todo
document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function editTodo(id, spanElement) {
    const currentTitle = spanElement.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.style.flex = '1';
    input.onblur = function() {
        saveEditedTodo(id, input.value);
    };
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            saveEditedTodo(id, input.value);
        }
    };
    spanElement.parentNode.replaceChild(input, spanElement);
    input.focus();
}

function saveEditedTodo(id, newTitle) {
    const todoItem = Array.from(document.getElementById('todoList').children)
        .find(item => item.querySelector('input'));
    if (todoItem) {
        fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle, completed: todoItem.classList.contains('completed') })
        })
        .then(response => response.json())
        .then(() => fetchTodos())
        .catch(error => console.error('Error updating todo:', error));
    }
}
