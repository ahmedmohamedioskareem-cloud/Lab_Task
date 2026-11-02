  let todos = [
    { id: 1, text: "See Lecture", done: false },
    { id: 2, text: "Solve assignment", done: false }
  ];
  let nextId = 3;
  let filter = "all";

  const list = document.getElementById("list");
  const input = document.getElementById("newTodo");
  const count = document.getElementById("count");

  const trashIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 12H7L6 9z"/></svg>';

  function addTodo() {
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: nextId++, text, done: false });
    input.value = "";
    render();
  }

  function visibleTodos() {
    if (filter === "active") return todos.filter(t => !t.done);
    if (filter === "completed") return todos.filter(t => t.done);
    return todos;
  }

  function startEdit(li, todo) {
    const span = li.querySelector(".text");
    const field = document.createElement("input");
    field.className = "edit";
    field.value = todo.text;
    span.replaceWith(field);
    field.focus();
    field.select();

    let finished = false;
    const finish = (save) => {
      if (finished) return;
      finished = true;
      const value = field.value.trim();
      if (save && value) todo.text = value;
      else if (save && !value) todos = todos.filter(t => t.id !== todo.id);
      render();
    };
    field.addEventListener("keydown", e => {
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
    field.addEventListener("blur", () => finish(true));
  }

  function render() {
    list.innerHTML = "";
    const items = visibleTodos();

    if (!items.length) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.style.height = "auto";
      empty.textContent = filter === "all" ? "Nothing here yet. Add your first todo above." : "No " + filter + " todos.";
      list.appendChild(empty);
    }

    items.forEach(todo => {
      const li = document.createElement("li");
      if (todo.done) li.classList.add("done");

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = todo.done;
      cb.setAttribute("aria-label", "Mark " + todo.text + " as done");
      cb.addEventListener("change", () => { todo.done = cb.checked; render(); });

      const span = document.createElement("span");
      span.className = "text";
      span.textContent = todo.text;
      span.addEventListener("dblclick", () => startEdit(li, todo));

      const del = document.createElement("button");
      del.className = "del";
      del.innerHTML = trashIcon;
      del.setAttribute("aria-label", "Delete " + todo.text);
      del.addEventListener("click", () => {
        todos = todos.filter(t => t.id !== todo.id);
        render();
      });

      li.append(cb, span, del);
      list.appendChild(li);
    });

    const left = todos.filter(t => !t.done).length;
    count.textContent = left + (left === 1 ? " item left" : " items left");

    document.querySelectorAll("#filters button").forEach(b =>
      b.classList.toggle("active", b.dataset.filter === filter));
  }

  document.getElementById("addBtn").addEventListener("click", addTodo);
  input.addEventListener("keydown", e => { if (e.key === "Enter") addTodo(); });

  document.getElementById("filters").addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    filter = btn.dataset.filter;
    render();
  });

  document.getElementById("clearCompleted").addEventListener("click", () => {
    todos = todos.filter(t => !t.done);
    render();
  });
  document.getElementById("clearAll").addEventListener("click", () => {
    todos = [];
    render();
  });

  render();
