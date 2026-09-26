const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const status = document.getElementById('status');

async function fetchTodos() {
  try {
    const res = await fetch('/api/todos');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const todos = await res.json();
    renderTodos(todos);
    status.textContent = 'Connected to backend ✓';
    status.className = 'status ok';
  } catch (err) {
    status.textContent = 'Could not reach backend: ' + err.message;
    status.className = 'status error';
  }
}

function renderTodos(todos) {
  list.innerHTML = '';
  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';

    const span = document.createElement('span');
    span.textContent = todo.text;
    span.addEventListener('click', () => toggleTodo(todo));

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

async function toggleTodo(todo) {
  await fetch(`/api/todos/${todo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !todo.completed }),
  });
  fetchTodos();
}

async function deleteTodo(id) {
  await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  fetchTodos();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  input.value = '';
  fetchTodos();
});

fetchTodos();
