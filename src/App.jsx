
import React, { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all') // all | active | completed
  const inputRef = useRef(null)

  // load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('todos_v1')
      if (raw) setTodos(JSON.parse(raw))
    } catch (e) {
      console.error('failed to parse todos', e)
    }
  }, [])

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem('todos_v1', JSON.stringify(todos))
    } catch (e) {
      console.error('failed to save todos', e)
    }
  }, [todos])

  function addTodo(e) {
    e?.preventDefault()
    const v = text.trim()
    if (!v) return
    const next = { id: Date.now(), text: v, completed: false }
    setTodos((s) => [next, ...s])
    setText('')
    inputRef.current?.focus()
  }

  function toggle(id) {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  function remove(id) {
    setTodos((s) => s.filter((t) => t.id !== id))
  }

  function updateText(id, newText) {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, text: newText } : t)))
  }

  function clearCompleted() {
    setTodos((s) => s.filter((t) => !t.completed))
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <div className="app-root">
      <div className="app-card">
        <header className="app-header">
          <h1>To‑Do</h1>
          <p className="muted">Organize tasks — built with hooks</p>
        </header>

        <form className="todo-form" onSubmit={addTodo}>
          <input
            ref={inputRef}
            className="todo-input"
            placeholder="Add a new task and press Enter"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addTodo} aria-label="Add task">
            Add
          </button>
        </form>

        <div className="controls">
          <div className="filters" role="tablist" aria-label="Filter todos">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
              All
            </button>
            <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>
              Active
            </button>
            <button
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
          <div className="counts">
            <span>{remaining} left</span>
            <button className="btn btn-ghost" onClick={clearCompleted} aria-label="Clear completed">
              Clear completed
            </button>
          </div>
        </div>

        <ul className="todo-list">
          {filtered.length === 0 && <li className="empty">No tasks — add one above ✨</li>}
          {filtered.map((t) => (
            <TodoItem key={t.id} todo={t} onToggle={toggle} onRemove={remove} onUpdate={updateText} />
          ))}
        </ul>

        <footer className="app-footer muted">Tip: double-click a task to edit it.</footer>
      </div>
    </div>
  )
}

function TodoItem({ todo, onToggle, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    setDraft(todo.text)
  }, [todo.text])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function save() {
    const trimmed = draft.trim()
    if (!trimmed) {
      onRemove(todo.id)
      return
    }
    onUpdate(todo.id, trimmed)
    setEditing(false)
  }

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label className="check">
        <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
        <span className="checkmark" />
      </label>

      {!editing ? (
        <div className="todo-body" onDoubleClick={() => setEditing(true)}>
          <span className="todo-text">{todo.text}</span>
        </div>
      ) : (
        <div className="todo-edit">
          <input
            ref={inputRef}
            className="todo-edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') {
                setDraft(todo.text)
                setEditing(false)
              }
            }}
          />
        </div>
      )}

      <div className="actions">
        <button className="btn btn-small" onClick={() => setEditing((s) => !s)} aria-label="Edit">
          {editing ? 'Done' : 'Edit'}
        </button>
        <button className="btn btn-danger" onClick={() => onRemove(todo.id)} aria-label="Delete">
          Delete
        </button>
      </div>
    </li>
  )
}

export default App
