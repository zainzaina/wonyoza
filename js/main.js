// ===== highlight active nav link =====
(function () {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path) link.classList.add("active");
  });
})();

// ===== notes app (uses localStorage) =====
const NOTES_KEY = "wonyoza_notes";

function loadNotes() {
  const seed = [
    { title: "pink idea", note: "write down your thoughts in a cute little note", date: "30.apr.26" },
    { title: "todo", note: "add styling, save locally, and keep notes after refresh", date: "28.apr.26" },
    { title: "happy", note: "this small notebook lives in your browser ♡", date: "25.apr.26" },
  ];
  try {
    const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || "null");
    return Array.isArray(saved) ? saved : seed;
  } catch { return seed; }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

let editIndex = null;

function renderNotes() {
  const list = document.getElementById("notes-list");
  if (!list) return;
  const notes = loadNotes();
  if (!notes.length) {
    list.innerHTML = `<p class="small">No notes yet. Add one to start your cute notebook! ♡</p>`;
    return;
  }
  list.innerHTML = notes.map((n, index) => `
    <div class="guest-entry">
      <header>
        <span class="name">♡ ${escapeHtml(n.title)}</span>
        <span class="kawaii-tag">${escapeHtml(n.date)}</span>
      </header>
      <p>${escapeHtml(n.note)}</p>
      <div class="note-actions">
        <button type="button" class="kawaii-pill small" data-action="edit" data-index="${index}">edit ♡</button>
        <button type="button" class="kawaii-pill small" data-action="delete" data-index="${index}">delete ♡</button>
      </div>
    </div>
  `).join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function setFormEditState(index) {
  const notes = loadNotes();
  if (index === null || index >= notes.length) {
    editIndex = null;
    document.querySelector("#notes-form button[type=submit]").textContent = "save ♡";
    return;
  }
  editIndex = index;
  const note = notes[index];
  const form = document.getElementById("notes-form");
  form.title.value = note.title;
  form.note.value = note.note;
  document.querySelector("#notes-form button[type=submit]").textContent = "update ♡";
}

function deleteNote(index) {
  const notes = loadNotes();
  notes.splice(index, 1);
  saveNotes(notes);
  if (editIndex === index) setFormEditState(null);
  renderNotes();
}

const form = document.getElementById("notes-form");
const notesList = document.getElementById("notes-list");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const note = form.note.value.trim();
    if (!title || !note) return;
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");
    const notes = loadNotes();
    if (editIndex !== null && editIndex < notes.length) {
      notes[editIndex] = { title, note, date: today };
      saveNotes(notes);
      setFormEditState(null);
    } else {
      saveNotes([{ title, note, date: today }, ...notes]);
    }
    form.reset();
    renderNotes();
  });
  renderNotes();
}

if (notesList) {
  notesList.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const index = Number(button.dataset.index);
    if (action === "edit") {
      setFormEditState(index);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "delete") {
      deleteNote(index);
    }
  });
}
