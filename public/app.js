const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const state = {
  name: localStorage.getItem("dl_name") || "Guest",
  fontColor: localStorage.getItem("dl_font_color") || "#17204a",
  barColor: localStorage.getItem("dl_bar_color") || "#ffffff",
  barOpacity: Number(
    localStorage.getItem("dl_bar_opacity") ||
    localStorage.getItem("dl_sidebar_opacity") ||
    "82"
  ),

  tasks: load("dl_tasks", [
    {
      id: 1,
      title: "Math homework",
      time: "15:00",
      duration: 60,
      priority: "high",
      done: false,
      color: "blue"
    },
    {
      id: 2,
      title: "Break & snack",
      time: "16:00",
      duration: 20,
      priority: "low",
      done: false,
      color: "mint"
    },
    {
      id: 3,
      title: "Study for physics test",
      time: "16:20",
      duration: 60,
      priority: "high",
      done: false,
      color: "pink"
    },
    {
      id: 4,
      title: "Football practice",
      time: "17:30",
      duration: 90,
      priority: "medium",
      done: false,
      color: "mint"
    },
    {
      id: 5,
      title: "Dinner",
      time: "19:30",
      duration: 45,
      priority: "low",
      done: false,
      color: "yellow"
    },
    {
      id: 6,
      title: "Work on project",
      time: "20:30",
      duration: 60,
      priority: "medium",
      done: false,
      color: "blue"
    }
  ]),

  goals: load("dl_goals", [
    {
      id: 1,
      name: "Learn JavaScript",
      progress: 42,
      daily: 30
    },
    {
      id: 2,
      name: "Finish competition project",
      progress: 68,
      daily: 45
    }
  ]),

  events: load("dl_events", [
    {
      id: 1,
      title: "Competition planning",
      date: "2027-03-12",
      time: "08:00",
      description: "Future competition day"
    },
    {
      id: 2,
      title: "Movie Night",
      date: "2027-12-17",
      time: "19:00",
      description: "Movie / fun night"
    }
  ]),

  timers: load("dl_timers", []),

  theme: localStorage.getItem("dl_theme") || "lavender",
  bg: localStorage.getItem("dl_bg") || "clean",
  customBg: localStorage.getItem("dl_custom_bg") || "",
  sound: localStorage.getItem("dl_sound") || ""
};

let currentFilter = "all";
let scheduleScope = "today";
let calendarDate = new Date();
let alarmAudio = null;

function save() {
  localStorage.setItem("dl_name", state.name);
  localStorage.setItem("dl_font_color", state.fontColor || "#17204a");
  localStorage.setItem("dl_bar_color", state.barColor || "#ffffff");
  localStorage.setItem("dl_bar_opacity", String(state.barOpacity ?? 82));

  localStorage.removeItem("dl_sidebar_opacity");

  localStorage.setItem("dl_tasks", JSON.stringify(state.tasks));
  localStorage.setItem("dl_goals", JSON.stringify(state.goals));
  localStorage.setItem("dl_events", JSON.stringify(state.events));
  localStorage.setItem("dl_timers", JSON.stringify(state.timers));

  localStorage.setItem("dl_theme", state.theme);
  localStorage.setItem("dl_bg", state.bg);

  if (state.customBg) {
    localStorage.setItem("dl_custom_bg", state.customBg);
  } else {
    localStorage.removeItem("dl_custom_bg");
  }

  if (state.sound) {
    localStorage.setItem("dl_sound", state.sound);
  } else {
    localStorage.removeItem("dl_sound");
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function hexToRgba(hex, alpha) {
  const clean = String(hex || "#ffffff").replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;

  const number = Number.parseInt(full, 16);

  if (!Number.isFinite(number)) {
    return `rgba(255,255,255,${alpha})`;
  }

  return `rgba(${number >> 16},${(number >> 8) & 255},${number & 255},${alpha})`;
}

function applyAppearance() {
  const root = document.documentElement;

  const themes = {
    lavender: {
      primary: "#685cf4",
      primary2: "#8a7fff",
      surface: "#ffffff",
      pageBg: "#f7f8ff",
      muted: "#707895",
      line: "#e8eaf4",
      nav: "#efedff"
    },

    ocean: {
      primary: "#1677d2",
      primary2: "#4bb8f5",
      surface: "#ffffff",
      pageBg: "#f5f9fd",
      muted: "#667d95",
      line: "#dfe8f1",
      nav: "#e6f2ff"
    },

    sunset: {
      primary: "#e56a4d",
      primary2: "#f0a05a",
      surface: "#ffffff",
      pageBg: "#fff8f4",
      muted: "#8b7168",
      line: "#f0e1da",
      nav: "#ffede6"
    },

    forest: {
      primary: "#2f9270",
      primary2: "#63b991",
      surface: "#ffffff",
      pageBg: "#f4fbf7",
      muted: "#688178",
      line: "#dcece5",
      nav: "#e4f6ef"
    },

    midnight: {
      primary: "#8b7cff",
      primary2: "#5f7dff",
      surface: "#171d35",
      pageBg: "#0f1428",
      muted: "#aeb6d1",
      line: "#313957",
      nav: "#272c4a"
    }
  };

  const theme = themes[state.theme] || themes.lavender;
  const isDark = state.theme === "midnight";

  const textColor =
    state.fontColor ||
    (isDark ? "#f5f7ff" : "#17204a");

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary2", theme.primary2);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--page-bg", theme.pageBg);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--line", theme.line);
  root.style.setProperty("--nav", theme.nav);
  root.style.setProperty("--ink", textColor);

  root.style.setProperty(
    "--bar-bg",
    hexToRgba(
      state.barColor || theme.surface,
      Math.max(0, Math.min(100, state.barOpacity)) / 100
    )
  );

  root.style.setProperty(
    "--bar-border",
    hexToRgba(theme.primary, 0.18)
  );

  document.body.classList.remove(
    "bg-clean",
    "bg-soft",
    "bg-night",
    "custom-bg"
  );

  document.body.classList.add(`bg-${state.bg || "clean"}`);

  if (state.customBg) {
    root.style.setProperty("--custom-bg", `url("${state.customBg}")`);
    document.body.classList.add("custom-bg");
  } else {
    root.style.setProperty("--custom-bg", "none");
  }

  if ($("#themeSelect")) {
    $("#themeSelect").value = state.theme;
  }

  if ($("#bgSelect")) {
    $("#bgSelect").value = state.bg;
  }

  if ($("#fontColor")) {
    $("#fontColor").value = state.fontColor || textColor;
  }

  if ($("#barColor")) {
    $("#barColor").value = state.barColor || theme.surface;
  }

  if ($("#barOpacity")) {
    $("#barOpacity").value = state.barOpacity;
    $("#barOpacityValue").textContent = `${state.barOpacity}%`;
  }

  if ($("#bgImageStatus")) {
    $("#bgImageStatus").textContent = state.customBg
      ? "Custom background image active."
      : "No custom image selected.";
  }
}

function populateGoalSelects() {
  [$("#taskGoal"), $("#eventGoal")].forEach((select) => {
    if (!select) return;

    const current = select.value;

    select.innerHTML =
      `<option value="">No goal</option>` +
      state.goals
        .map(
          (goal) =>
            `<option value="${goal.id}">${escapeHTML(goal.name)}</option>`
        )
        .join("");

    if (
      state.goals.some(
        (goal) => String(goal.id) === current
      )
    ) {
      select.value = current;
    }
  });
}

function syncGoalProgress() {
  state.goals.forEach((goal) => {
    if (goal.baseProgress === undefined) {
      goal.baseProgress = Number(goal.progress) || 0;
    }

    const linkedMinutes = state.tasks
      .filter(
        (task) =>
          Number(task.goalId) === Number(goal.id) &&
          task.done
      )
      .reduce(
        (sum, task) =>
          sum + Math.max(0, Number(task.duration) || 0),
        0
      );

    const daily = Math.max(
      1,
      Number(goal.daily) || 30
    );

    goal.progress = Math.min(
      100,
      Math.round(
        Number(goal.baseProgress) +
        (linkedMinutes / daily) * 10
      )
    );
  });
}

function openConfirm(
  title,
  message,
  actionText,
  callback
) {
  $("#confirmTitle").textContent = title;
  $("#confirmMessage").textContent = message;
  $("#confirmAction").textContent = actionText;

  $("#confirmAction").onclick = () => {
    closeModals();
    callback();
  };

  openModal("confirmModal");
}

function openInfo(title, message) {
  $("#infoTitle").textContent = title;
  $("#infoMessage").textContent = message;
  openModal("infoModal");
}

function openTaskModal(task = null) {
  const form = $("#taskForm");

  form.dataset.editId = task
    ? String(task.id)
    : "";

  $("#taskModalTitle").textContent = task
    ? "Edit task"
    : "Add a task";

  $("#taskSubmit").textContent = task
    ? "Save changes"
    : "Add to schedule";

  populateGoalSelects();

  if (task) {
    $("#taskName").value = task.title || "";
    $("#taskDate").value =
      task.date || todayISO();

    $("#taskTime").value =
      task.time || "";

    $("#taskDuration").value =
      task.duration || 60;

    $("#taskPriority").value =
      task.priority || "medium";

    $("#taskGoal").value =
      task.goalId
        ? String(task.goalId)
        : "";
  } else {
    form.reset();
    $("#taskDate").value = todayISO();
    $("#taskGoal").value = "";
  }

  openModal("taskModal");
}

function openEventModal(date) {
  const form = $("#eventForm");

  form.reset();

  $("#eventDate").value =
    date || todayISO();

  populateGoalSelects();

  openModal("eventModal");
}

function openEventChooser(events) {
  $("#eventChooserList").innerHTML =
    events
      .map(
        (event) => `
          <button
            class="event-choice"
            data-event-choice="${event.id}"
          >
            <strong>${escapeHTML(event.title)}</strong>
            <small>${event.time || "No time"}</small>
          </button>
        `
      )
      .join("");

  $$("[data-event-choice]").forEach(
    (button) => {
      button.onclick = () => {
        const event = state.events.find(
          (item) =>
            item.id ==
            button.dataset.eventChoice
        );

        if (event) {
          closeModals();
          openEventDetails(event);
        }
      };
    }
  );

  openModal("eventChooserModal");
}

function openEventDetails(event) {
  $("#eventDetailsTitle").textContent =
    event.title;

  $("#eventDetailsDate").textContent =
    `${event.date}${
      event.time
        ? ` · ${event.time}`
        : ""
    }`;

  $("#eventDetailsDescription").textContent =
    event.description ||
    "No description provided.";

  const goal = state.goals.find(
    (item) =>
      Number(item.id) ===
      Number(event.goalId)
  );

  $("#eventDetailsGoal").textContent =
    goal
      ? `Linked goal: ${goal.name}`
      : "No linked goal";

  openModal("eventDetailsModal");
}

function render() {
  syncGoalProgress();
  populateGoalSelects();
  applyAppearance();

  $("#dateLabel").textContent =
    formatDate(new Date()).toUpperCase();

  $("#pageTitle").innerHTML =
    `${getGreeting()}, ${escapeHTML(
      state.name
    )} <span>👋</span>`;

  $("#nameInput").value = state.name;

  const done = state.tasks.filter(
    (task) => task.done
  ).length;

  const total = state.tasks.length;

  const percent = total
    ? Math.round((done / total) * 100)
    : 0;

  $("#remainingCount").textContent =
    `${total - done} task${
      total - done === 1 ? "" : "s"
    }`;

  $("#progressText").textContent =
    `${percent}%`;

  $("#progressRing").style.setProperty(
    "--progress",
    `${percent * 3.6}deg`
  );

  $("#progressHeadline").textContent =
    percent >= 80
      ? "Amazing progress!"
      : percent
      ? "You're moving forward."
      : "Let's get started.";

  renderTimeline(
    $("#timeline"),
    state.tasks
  );

  renderGoalPreview();
  renderTasks();
  renderGoals();
  renderSchedule();
  renderCalendar();
  renderTimers();
  renderUpcoming();

  $("#soundStatus").textContent =
    state.sound
      ? "Custom reminder sound loaded."
      : "No custom sound selected.";

  $("#notificationStatus").textContent =
    `Notification permission: ${
      "Notification" in window
        ? Notification.permission
        : "unsupported"
    }`;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 5) {
    return "Good night";
  }

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  if (hour < 22) {
    return "Good evening";
  }

  return "Good night";
}

function completeTask(id) {
  const task = state.tasks.find(
    (item) => item.id == id
  );

  if (!task) return;

  task.done = !task.done;

  syncGoalProgress();
  save();
  render();
}

function renderTimeline(element, tasks) {
  element.innerHTML =
    [...tasks]
      .sort(
        (a, b) =>
          (a.time || "").localeCompare(
            b.time || ""
          )
      )
      .map(
        (task) => `
          <div class="timeline-item ${
            task.done ? "done" : ""
          }">
            <div class="time">
              ${escapeHTML(task.time || "")}
            </div>

            <div class="event ${
              task.color || "blue"
            }">
              <strong>
                ${escapeHTML(task.title)}
              </strong>

              <small>
                ${task.duration} min ·
                ${escapeHTML(task.priority)}
                priority
              </small>
            </div>

            <button
              class="check"
              data-complete="${task.id}"
              aria-label="Complete task"
            >
              ${task.done ? "✓" : ""}
            </button>
          </div>
        `
      )
      .join("") ||
    `
      <div class="panel">
        <p class="muted">
          No tasks yet.
        </p>
      </div>
    `;

  $$("[data-complete]").forEach(
    (button) => {
      button.onclick = () =>
        completeTask(
          button.dataset.complete
        );
    }
  );
}

function renderTasks() {
  let tasks = state.tasks;

  if (currentFilter === "open") {
    tasks = tasks.filter(
      (task) => !task.done
    );
  }

  if (currentFilter === "done") {
    tasks = tasks.filter(
      (task) => task.done
    );
  }

  $("#taskList").innerHTML =
    tasks
      .map((task) => {
        const goal = state.goals.find(
          (item) =>
            Number(item.id) ===
            Number(task.goalId)
        );

        return `
          <div class="task-row">

            <button
              class="check"
              data-complete="${task.id}"
              aria-label="Complete task"
            >
              ${task.done ? "✓" : ""}
            </button>

            <div class="task-info">
              <strong>
                ${escapeHTML(task.title)}
              </strong>

              <small>
                ${escapeHTML(task.time || "")}
                · ${task.duration} min
                ${
                  goal
                    ? ` · 🎯 ${escapeHTML(
                        goal.name
                      )}`
                    : ""
                }
              </small>
            </div>

            <span
              class="priority ${task.priority}"
            >
              ${escapeHTML(task.priority)}
            </span>

            <div class="task-actions">

              <button
                class="text-btn"
                data-edit-task="${task.id}"
              >
                Edit
              </button>

              <button
                class="text-btn danger"
                data-delete-task="${task.id}"
              >
                Delete
              </button>

            </div>

          </div>
        `;
      })
      .join("") ||
    `
      <div class="panel">
        <p class="muted">
          No tasks here.
        </p>
      </div>
    `;

  $$("#taskList [data-complete]").forEach(
    (button) => {
      button.onclick = () =>
        completeTask(
          button.dataset.complete
        );
    }
  );

  $$("#taskList [data-edit-task]").forEach(
    (button) => {
      button.onclick = () => {
        const task = state.tasks.find(
          (item) =>
            item.id ==
            button.dataset.editTask
        );

        if (task) {
          openTaskModal(task);
        }
      };
    }
  );

  $$("#taskList [data-delete-task]").forEach(
    (button) => {
      button.onclick = () => {
        const task = state.tasks.find(
          (item) =>
            item.id ==
            button.dataset.deleteTask
        );

        if (!task) return;

        openConfirm(
          "Delete task?",
          `Delete “${task.title}” from your schedule?`,
          "Delete task",
          () => {
            state.tasks =
              state.tasks.filter(
                (item) =>
                  item.id !== task.id
              );

            syncGoalProgress();
            save();
            render();
          }
        );
      };
    }
  );
}

function renderGoals() {
  $("#goalGrid").innerHTML =
    state.goals
      .map(
        (goal) => `
          <div class="goal-card">

            <div class="goal-heading">

              <div>
                <p class="eyebrow">
                  GOAL
                </p>

                <h3>
                  ${escapeHTML(goal.name)}
                </h3>
              </div>

              <button
                class="text-btn danger"
                data-delete-goal="${goal.id}"
              >
                Delete
              </button>

            </div>

            <div class="goal-meta">
              <span>
                ${goal.daily} min/day
              </span>

              <strong>
                ${goal.progress}%
              </strong>
            </div>

            <div class="goal-bar">
              <i
                style="width:${goal.progress}%"
              ></i>
            </div>

            <small class="muted">
              Linked completed tasks add
              progress automatically.
            </small>

          </div>
        `
      )
      .join("") ||
    `
      <div class="panel">
        <p class="muted">
          No goals yet. Create one to get started.
        </p>
      </div>
    `;

  $$("[data-delete-goal]").forEach(
    (button) => {
      button.onclick = () => {
        const id = Number(
          button.dataset.deleteGoal
        );

        const goal = state.goals.find(
          (item) => item.id === id
        );

        if (!goal) return;

        openConfirm(
          "Delete goal?",
          `Delete “${goal.name}”? Linked tasks and events will stay, but their goal link will be removed.`,
          "Delete goal",
          () => {
            state.goals =
              state.goals.filter(
                (item) => item.id !== id
              );

            state.tasks.forEach(
              (task) => {
                if (
                  Number(task.goalId) === id
                ) {
                  delete task.goalId;
                }
              }
            );

            state.events.forEach(
              (event) => {
                if (
                  Number(event.goalId) === id
                ) {
                  delete event.goalId;
                }
              }
            );

            save();
            render();
          }
        );
      };
    }
  );
}

function renderGoalPreview() {
  $("#goalPreview").innerHTML =
    state.goals
      .slice(0, 2)
      .map(
        (goal) => `
          <div class="goal-row">

            <div class="goal-icon">
              ◎
            </div>

            <div class="goal-preview-content">
              <strong>
                ${escapeHTML(goal.name)}
              </strong>

              <div class="goal-bar">
                <i
                  style="width:${goal.progress}%"
                ></i>
              </div>
            </div>

            <span class="goal-percent">
              ${goal.progress}%
            </span>

          </div>
        `
      )
      .join("");
}

function renderUpcoming() {
  const future =
    state.events
      .filter(
        (event) =>
          event.date >= todayISO()
      )
      .sort(
        (a, b) =>
          (a.date + a.time).localeCompare(
            b.date + b.time
          )
      )
      .slice(0, 4);

  $("#upcomingEvents").innerHTML =
    future
      .map(
        (event) => `
          <div class="event-preview">

            <div>
              <strong>
                ${escapeHTML(event.title)}
              </strong>

              <small class="muted">
                ${event.date}
                ${
                  event.time
                    ? ` · ${event.time}`
                    : ""
                }
              </small>
            </div>

            <span>📅</span>

          </div>
        `
      )
      .join("") ||
    `
      <p class="muted">
        No future events yet.
      </p>
    `;
}

function renderSchedule() {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const iso = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    today.getDate() + 1
  );

  const endWeek =
    new Date(today);

  endWeek.setDate(
    today.getDate() + 7
  );

  let tasks =
    state.tasks.map(
      (task) => ({
        ...task,
        date:
          task.date ||
          todayISO()
      })
    );

  if (scheduleScope === "today") {
    tasks = tasks.filter(
      (task) =>
        task.date === iso(today)
    );
  }

  if (scheduleScope === "tomorrow") {
    tasks = tasks.filter(
      (task) =>
        task.date ===
        iso(tomorrow)
    );
  }

  if (scheduleScope === "week") {
    tasks = tasks.filter(
      (task) =>
        task.date >= iso(today) &&
        task.date < iso(endWeek)
    );
  }

  if (scheduleScope === "upcoming") {
    tasks = tasks.filter(
      (task) =>
        !task.done &&
        task.date >= iso(today)
    );
  }

  const element =
    $("#scheduleTimeline");

  if (!tasks.length) {
    const label = {
      today: "today",
      tomorrow: "tomorrow",
      week: "this week",
      upcoming: "upcoming"
    }[scheduleScope];

    element.innerHTML = `
      <div class="panel">
        <p class="muted">
          No tasks scheduled for ${label} yet.
          Add a task and choose its date.
        </p>
      </div>
    `;

    return;
  }

  renderTimeline(
    element,
    tasks
  );
}

function renderCalendar() {
  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  $("#calendarTitle").textContent =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    ).format(calendarDate);

  const first =
    new Date(
      year,
      month,
      1
    );

  const start =
    (first.getDay() + 6) % 7;

  const days =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const previousDays =
    new Date(
      year,
      month,
      0
    ).getDate();

  let html =
    [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ]
      .map(
        (day) =>
          `<div class="calendar-head">${day}</div>`
      )
      .join("");

  for (
    let i = 0;
    i < 42;
    i++
  ) {
    const number =
      i - start + 1;

    let date;
    let day;
    let muted = false;

    if (number < 1) {
      day =
        previousDays +
        number;

      date =
        new Date(
          year,
          month - 1,
          day
        );

      muted = true;
    } else if (
      number > days
    ) {
      day =
        number - days;

      date =
        new Date(
          year,
          month + 1,
          day
        );

      muted = true;
    } else {
      day = number;

      date =
        new Date(
          year,
          month,
          day
        );
    }

    const iso =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;

    const events =
      state.events.filter(
        (event) =>
          event.date === iso
      );

    html += `
      <div
        class="calendar-cell ${
          muted
            ? "muted-cell"
            : ""
        } ${
          iso === todayISO()
            ? "today"
            : ""
        }"
        data-date="${iso}"
      >

        <div class="calendar-day">
          ${day}
        </div>

        ${events
          .slice(0, 3)
          .map(
            (event) =>
              `<div class="calendar-event">${escapeHTML(
                event.title
              )}</div>`
          )
          .join("")}

      </div>
    `;
  }

  $("#calendarGrid").innerHTML =
    html;

  $$(".calendar-cell").forEach(
    (cell) => {
      cell.onclick = () => {
        if (
          cell.classList.contains(
            "muted-cell"
          )
        ) {
          return;
        }

        const events =
          state.events.filter(
            (event) =>
              event.date ===
              cell.dataset.date
          );

        if (events.length === 1) {
          openEventDetails(
            events[0]
          );
        } else if (
          events.length > 1
        ) {
          openEventChooser(
            events
          );
        } else {
          openEventModal(
            cell.dataset.date
          );
        }
      };
    }
  );

  const future =
    state.events
      .filter(
        (event) =>
          event.date >= todayISO()
      )
      .sort(
        (a, b) =>
          (a.date + a.time).localeCompare(
            b.date + b.time
          )
      );

  $("#eventList").innerHTML =
    future
      .map(
        (event) => `
          <div class="event-row">

            <div>
              <strong>
                ${escapeHTML(event.title)}
              </strong>

              <div class="muted">
                ${event.date}
                ${
                  event.time
                    ? ` · ${event.time}`
                    : ""
                }
                ${
                  event.description
                    ? ` · ${escapeHTML(
                        event.description
                      )}`
                    : ""
                }
              </div>
            </div>

            <button
              class="text-btn danger"
              data-delete-event="${event.id}"
            >
              Delete
            </button>

          </div>
        `
      )
      .join("") ||
    `
      <p class="muted">
        No upcoming events.
      </p>
    `;

  $$("[data-delete-event]").forEach(
    (button) => {
      button.onclick = () => {
        const event =
          state.events.find(
            (item) =>
              item.id ==
              button.dataset.deleteEvent
          );

        if (!event) return;

        openConfirm(
          "Delete event?",
          `Delete “${event.title}” from your calendar?`,
          "Delete event",
          () => {
            state.events =
              state.events.filter(
                (item) =>
                  item.id !== event.id
              );

            save();
            render();
          }
        );
      };
    }
  );
}

function renderTimers() {
  const now = Date.now();

  state.timers.forEach(
    (timer) => {
      if (
        timer.running &&
        timer.end <= now
      ) {
        timer.running = false;
        timer.done = true;
        timer.remaining = 0;

        triggerReminder(timer);
      }
    }
  );

  $("#timerGrid").innerHTML =
    state.timers.length
      ? state.timers
          .map(
            (timer) => `
              <div
                class="timer-card ${
                  timer.running
                    ? "running"
                    : ""
                }"
              >

                <p class="eyebrow">
                  ${
                    timer.running
                      ? "RUNNING"
                      : timer.done
                      ? "DONE"
                      : "PAUSED"
                  }
                </p>

                <h3>
                  ${escapeHTML(
                    timer.name
                  )}
                </h3>

                <div
                  class="timer-time"
                  data-timer="${timer.id}"
                >
                  ${formatRemaining(
                    timer.remaining
                  )}
                </div>

                <div class="timer-actions">

                  ${
                    timer.running
                      ? `<button data-pause="${timer.id}">Pause</button>`
                      : `<button data-start="${timer.id}">${
                          timer.done
                            ? "Restart"
                            : "Start"
                        }</button>`
                  }

                  <button
                    class="danger"
                    data-delete-timer="${timer.id}"
                  >
                    Delete
                  </button>

                </div>

              </div>
            `
          )
          .join("")
      : `
        <div class="timer-empty">
          <strong>
            No timers yet.
          </strong>
          <br>
          Try “Set a timer for 13 minutes
          to check the washing machine.”
        </div>
      `;

  $$("[data-start]").forEach(
    (button) =>
      (button.onclick = () =>
        startTimer(
          Number(
            button.dataset.start
          )
        ))
  );

  $$("[data-pause]").forEach(
    (button) =>
      (button.onclick = () =>
        pauseTimer(
          Number(
            button.dataset.pause
          )
        ))
  );

  $$("[data-delete-timer]").forEach(
    (button) => {
      button.onclick = () => {
        const timer =
          state.timers.find(
            (item) =>
              item.id ==
              button.dataset.deleteTimer
          );

        if (!timer) return;

        openConfirm(
          "Delete timer?",
          `Delete “${timer.name}”?`,
          "Delete timer",
          () => {
            state.timers =
              state.timers.filter(
                (item) =>
                  item.id !== timer.id
              );

            save();
            render();
          }
        );
      };
    }
  );
}

function formatRemaining(seconds) {
  seconds = Math.max(
    0,
    Math.ceil(seconds || 0)
  );

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const secs =
    seconds % 60;

  return hours
    ? `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(
        2,
        "0"
      )}`
    : `${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(
        2,
        "0"
      )}`;
}

function startTimer(id) {
  const timer =
    state.timers.find(
      (item) => item.id === id
    );

  if (!timer) return;

  const seconds =
    timer.done
      ? Number(
          timer.originalSeconds || 60
        )
      : Number(
          timer.remaining || 60
        );

  timer.done = false;
  timer.running = true;
  timer.end =
    Date.now() + seconds * 1000;
  timer.remaining = seconds;

  save();
  render();
}

function pauseTimer(id) {
  const timer =
    state.timers.find(
      (item) => item.id === id
    );

  if (!timer) return;

  timer.remaining =
    Math.max(
      0,
      Math.ceil(
        (timer.end - Date.now()) /
          1000
      )
    );

  timer.running = false;

  save();
  render();
}

function triggerReminder(timer) {
  startAlarmLoop();

  if (
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification(
      `DailyLiner reminder: ${timer.name}`,
      {
        body:
          "Your timer is finished."
      }
    );
  }

  $("#alarmTitle").textContent =
    timer.name;

  openModal("alarmModal");
}

function startAlarmLoop() {
  stopAlarm();

  if (state.sound) {
    alarmAudio =
      new Audio(state.sound);

    alarmAudio.loop = true;

    alarmAudio
      .play()
      .catch(() => {});

    return;
  }

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) return;

  const context =
    new AudioContext();

  const oscillator =
    context.createOscillator();

  const gain =
    context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;

  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(
    context.destination
  );

  oscillator.start();

  alarmAudio = {
    stop: () => {
      try {
        oscillator.stop();
      } catch {}

      try {
        context.close();
      } catch {}
    }
  };
}

function stopAlarm() {
  if (!alarmAudio) return;

  if (alarmAudio.pause) {
    alarmAudio.pause();
  }

  if (
    alarmAudio.currentTime !==
    undefined
  ) {
    alarmAudio.currentTime = 0;
  }

  if (alarmAudio.stop) {
    alarmAudio.stop();
  }

  alarmAudio = null;
}

function playSound() {
  if (state.sound) {
    const audio =
      new Audio(state.sound);

    audio
      .play()
      .catch(() => {});

    return;
  }

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) return;

  const context =
    new AudioContext();

  const oscillator =
    context.createOscillator();

  const gain =
    context.createGain();

  oscillator.frequency.value =
    880;

  gain.gain.setValueAtTime(
    0.0001,
    context.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.2,
    context.currentTime + 0.02
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + 0.5
  );

  oscillator.connect(gain);
  gain.connect(
    context.destination
  );

  oscillator.start();

  oscillator.stop(
    context.currentTime + 0.5
  );
}

setInterval(() => {
  const hasRunning =
    state.timers.some(
      (timer) => timer.running
    );

  if (!hasRunning) return;

  state.timers.forEach(
    (timer) => {
      if (timer.running) {
        timer.remaining =
          Math.max(
            0,
            Math.ceil(
              (timer.end -
                Date.now()) /
                1000
            )
          );
      }

      if (
        timer.running &&
        timer.remaining <= 0
      ) {
        timer.running = false;
        timer.done = true;

        triggerReminder(timer);
      }
    }
  );

  save();
  renderTimers();
}, 1000);

function openAssistant(prefill) {
  $("#assistantDrawer").classList.add(
    "open"
  );

  $("#overlay").classList.add(
    "show"
  );

  bootChat();

  if (prefill) {
    $("#chatInput").value =
      prefill;

    sendMessage();
  }
}

function closeAssistant() {
  $("#assistantDrawer").classList.remove(
    "open"
  );

  if (
    !$$(".modal.show").length
  ) {
    $("#overlay").classList.remove(
      "show"
    );
  }
}

function addBubble(
  text,
  who = "ai",
  extra = ""
) {
  const element =
    document.createElement("div");

  element.className =
    `bubble ${who}`;

  element.innerHTML =
    escapeHTML(text) + extra;

  $("#chat").appendChild(
    element
  );

  $("#chat").scrollTop =
    $("#chat").scrollHeight;
}

function bootChat() {
  if (
    !$("#chat").children.length
  ) {
    addBubble(
      `Hi ${escapeHTML(
        state.name
      )}! 👋 I'm Lina. Tell me what you need to plan, schedule, or remember.`
    );
  }
}

async function sendMessage() {
  const input =
    $("#chatInput");

  const text =
    input.value.trim();

  if (!text) return;

  input.value = "";

  addBubble(
    text,
    "user"
  );

  addBubble(
    "Thinking…"
  );

  const loading =
    $("#chat").lastElementChild;

  try {
    const result =
      await realAI(text);

    loading.remove();

    const extra =
      result.action
        ? `
          <div class="action-card">

            <strong>
              ${escapeHTML(
                result.action.title ||
                  "Suggested change"
              )}
            </strong>

            <div class="action-description">
              ${escapeHTML(
                result.action.description ||
                  ""
              )}
            </div>

            <button data-action="apply">
              Apply
            </button>

          </div>
        `
        : "";

    addBubble(
      result.message ||
        "Done!",
      "ai",
      extra
    );

    if (result.action) {
      $(
        "#chat"
      ).lastElementChild
        .querySelector(
          "[data-action]"
        )
        .onclick = () =>
          applyAction(
            result.action
          );
    }

    if (result.whatif) {
      $("#whatifResult").innerHTML =
        result.whatif;
    }
  } catch {
    loading.remove();

    addBubble(
      "I couldn't reach the AI service right now. Your planner, calendar, and timers still work locally."
    );
  }
}

async function realAI(text) {
  const response =
    await fetch(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          message: text,
          tasks: state.tasks,
          goals: state.goals,
          events: state.events
        })
      }
    );

  if (!response.ok) {
    throw new Error(
      "API error"
    );
  }

  return response.json();
}

function applyAction(action) {
  if (action.type === "timer") {
    createTimer(
      action.title ||
        "Reminder",
      Math.max(
        1,
        Number(
          action.minutes || 0
        ) * 60
      )
    );
  }

  else if (
    action.type === "event"
  ) {
    createEvent(
      action.title ||
        "New event",
      action.date ||
        todayISO(),
      action.time || "",
      action.description ||
        ""
    );
  }

  else if (
    action.type === "break"
  ) {
    const task =
      state.tasks.find(
        (item) =>
          item.title
            .toLowerCase()
            .includes("study")
      );

    if (task) {
      state.tasks.push({
        id: Date.now(),
        title:
          "Break & recharge",
        date:
          task.date ||
          todayISO(),
        time: addMinutes(
          task.time,
          task.duration
        ),
        duration: 20,
        priority: "low",
        done: false,
        color: "mint"
      });
    }
  }

  else if (
    action.type === "reschedule"
  ) {
    const task =
      state.tasks.find(
        (item) =>
          !item.done &&
          item.priority ===
            "medium"
      );

    if (task) {
      task.time =
        addMinutes(
          task.time,
          60
        );
    }
  }

  else if (
    action.type === "replace"
  ) {
    state.tasks.push({
      id: Date.now(),
      title:
        "Focused project work",
      date: todayISO(),
      time: "17:30",
      duration: 90,
      priority: "high",
      done: false,
      color: "blue"
    });

    state.tasks =
      state.tasks.filter(
        (task) =>
          task.title !==
          "Football practice"
      );
  }

  else if (
    action.type === "plan"
  ) {
    state.tasks =
      state.tasks.map(
        (task) =>
          task.title ===
          "Work on project"
            ? {
                ...task,
                time: "20:30"
              }
            : task
      );
  }

  save();
  render();

  addBubble(
    "Done! I updated your DailyLiner."
  );
}

function createTimer(
  name,
  seconds
) {
  const sec =
    Math.max(
      1,
      Math.round(seconds)
    );

  state.timers.push({
    id: Date.now(),
    name,
    remaining: sec,
    originalSeconds: sec,
    running: true,
    end:
      Date.now() +
      sec * 1000,
    done: false
  });

  save();
  render();
  showPage("timers");
}

function createEvent(
  title,
  date,
  time,
  description,
  goalId = null
) {
  state.events.push({
    id: Date.now(),
    title,
    date,
    time,
    description,
    goalId
  });

  save();
  render();
  showPage("calendar");
}

function addMinutes(
  time,
  minutes
) {
  let [
    hours,
    mins
  ] = String(
    time || "00:00"
  )
    .split(":")
    .map(Number);

  mins += minutes;

  hours =
    (hours +
      Math.floor(
        mins / 60
      )) %
    24;

  mins %= 60;

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    mins
  ).padStart(
    2,
    "0"
  )}`;
}

function showPage(page) {
  $$(".page").forEach(
    (element) =>
      element.classList.remove(
        "active"
      )
  );

  $(
    "#page-" + page
  )?.classList.add(
    "active"
  );

  $$(".nav-item").forEach(
    (nav) =>
      nav.classList.toggle(
        "active",
        nav.dataset.page ===
          page
      )
  );

  const titles = {
    dashboard:
      getGreeting(),
    schedule:
      "My Schedule",
    calendar:
      "Calendar",
    tasks:
      "Tasks",
    goals:
      "Your Goals",
    timers:
      "Timers & Reminders",
    whatif:
      "What-If Mode",
    settings:
      "Settings & Customization",
    about:
      "About DailyLiner",
    contact:
      "Contact"
  };

  $("#pageTitle").innerHTML =
    `${
      titles[page] ||
      "DailyLiner"
    }${
      page === "dashboard"
        ? `, ${escapeHTML(
            state.name
          )}`
        : ""
    } <span>👋</span>`;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function openModal(id) {
  $("#" + id).classList.add(
    "show"
  );

  $("#overlay").classList.add(
    "show"
  );
}

function closeModals() {
  $$(".modal").forEach(
    (modal) =>
      modal.classList.remove(
        "show"
      )
  );

  if (
    !$("#assistantDrawer").classList.contains(
      "open"
    )
  ) {
    $("#overlay").classList.remove(
      "show"
    );
  }
}

$$(".nav-item").forEach(
  (nav) =>
    (nav.onclick = () =>
      showPage(
        nav.dataset.page
      ))
);

$$("[data-page-link]").forEach(
  (button) =>
    (button.onclick = () =>
      showPage(
        button.dataset.pageLink
      ))
);

$$(".top-links button").forEach(
  (button) =>
    (button.onclick = () =>
      showPage(
        button.dataset.page
      ))
);

$("#openAssistant").onclick =
  () => openAssistant();

$("#closeAssistant").onclick =
  closeAssistant;

$("#overlay").onclick = () => {
  closeModals();
  closeAssistant();
};

$("#sendChat").onclick =
  sendMessage;

$("#chatInput").addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  }
);

$$("[data-prompt]").forEach(
  (button) =>
    (button.onclick = () =>
      openAssistant(
        button.dataset.prompt
      ))
);

$("#planDayBtn").onclick =
  () =>
    openAssistant(
      "Plan my day"
    );

$("#scheduleWithAi").onclick =
  () =>
    openAssistant(
      "Plan my day"
    );

$("#openTimer").onclick =
  () =>
    openModal("timerModal");

$("#addTimerBtn").onclick =
  () =>
    openModal("timerModal");

$("#addEventBtn").onclick =
  () =>
    openEventModal(
      todayISO()
    );

$$(
  "#addTaskBtn,#addTaskBtn2"
).forEach(
  (button) =>
    (button.onclick = () =>
      openTaskModal())
);

$("#addGoalBtn").onclick =
  () =>
    openModal("goalModal");

// Dashboard shortcuts
$$("[data-quick]").forEach(
  (button) => {
    button.onclick = () => {
      const target = {
        timer: "timers",
        event: "calendar",
        custom: "settings"
      }[
        button.dataset.quick
      ];

      if (target) {
        showPage(target);
      }
    };
  }
);

$$(".close-modal").forEach(
  (button) =>
    (button.onclick =
      closeModals)
);

$$(".filter").forEach(
  (button) =>
    (button.onclick = () => {
      currentFilter =
        button.dataset.filter;

      $$(".filter").forEach(
        (item) =>
          item.classList.remove(
            "active"
          )
      );

      button.classList.add(
        "active"
      );

      renderTasks();
    })
);

$$(".day-chip").forEach(
  (button) =>
    (button.onclick = () => {
      scheduleScope =
        button.dataset.scope;

      $$(".day-chip").forEach(
        (item) =>
          item.classList.remove(
            "active"
          )
      );

      button.classList.add(
        "active"
      );

      renderSchedule();
    })
);

$("#prevMonth").onclick =
  () => {
    calendarDate.setMonth(
      calendarDate.getMonth() -
        1
    );

    renderCalendar();
  };

$("#nextMonth").onclick =
  () => {
    calendarDate.setMonth(
      calendarDate.getMonth() +
        1
    );

    renderCalendar();
  };

$("#todayMonth").onclick =
  () => {
    calendarDate =
      new Date();

    renderCalendar();
  };

$("#taskForm").onsubmit =
  (event) => {
    event.preventDefault();

    const id =
      event.target.dataset.editId
        ? Number(
            event.target.dataset
              .editId
          )
        : null;

    const data = {
      title:
        $("#taskName").value.trim(),

      date:
        $("#taskDate").value ||
        todayISO(),

      time:
        $("#taskTime").value,

      duration:
        Number(
          $("#taskDuration").value
        ),

      priority:
        $("#taskPriority").value,

      goalId:
        $("#taskGoal").value
          ? Number(
              $("#taskGoal").value
            )
          : null
    };

    if (id) {
      const task =
        state.tasks.find(
          (item) =>
            item.id === id
        );

      if (task) {
        Object.assign(
          task,
          data
        );
      }
    } else {
      state.tasks.push({
        id: Date.now(),
        ...data,
        done: false,
        color:
          [
            "blue",
            "mint",
            "pink",
            "yellow"
          ][
            state.tasks.length %
              4
          ]
      });
    }

    syncGoalProgress();
    save();
    render();
    closeModals();

    event.target.reset();
    event.target.dataset.editId =
      "";
  };

$("#goalForm").onsubmit =
  (event) => {
    event.preventDefault();

    state.goals.push({
      id: Date.now(),
      name:
        $("#goalName").value.trim(),
      progress: 0,
      baseProgress: 0,
      daily:
        Number(
          $("#goalTime").value
        )
    });

    save();
    render();
    closeModals();

    event.target.reset();
  };

$("#timerForm").onsubmit =
  (event) => {
    event.preventDefault();

    createTimer(
      $("#timerName").value.trim(),

      Number(
        $("#timerHours").value
      ) *
        3600 +

        Number(
          $("#timerMinutes").value
        ) *
          60 +

        Number(
          $("#timerSeconds").value
        )
    );

    closeModals();
    event.target.reset();
  };

$("#eventForm").onsubmit =
  (event) => {
    event.preventDefault();

    createEvent(
      $("#eventName").value.trim(),
      $("#eventDate").value,
      $("#eventTime").value,
      $("#eventDescription").value.trim(),

      $("#eventGoal").value
        ? Number(
            $("#eventGoal").value
          )
        : null
    );

    closeModals();
    event.target.reset();
  };

$("#saveSettings").onclick =
  () => {
    state.name =
      $("#nameInput").value.trim() ||
      "Guest";

    save();
    render();

    openInfo(
      "Saved",
      "Your name has been updated."
    );
  };

$("#themeSelect").onchange =
  (event) => {
    state.theme =
      event.target.value;

    save();
    applyAppearance();
    render();
  };

$("#bgSelect").onchange =
  (event) => {
    state.bg =
      event.target.value;

    save();
    applyAppearance();
  };

$("#fontColor").oninput =
  (event) => {
    state.fontColor =
      event.target.value;

    save();
    applyAppearance();
  };

$("#barColor").oninput =
  (event) => {
    state.barColor =
      event.target.value;

    save();
    applyAppearance();
  };

$("#barOpacity").oninput =
  (event) => {
    state.barOpacity =
      Number(
        event.target.value
      );

    save();
    applyAppearance();
  };

$("#bgImageInput").onchange =
  (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      6 * 1024 * 1024
    ) {
      openInfo(
        "Image too large",
        "Please choose an image under 6 MB."
      );

      event.target.value = "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      state.customBg =
        reader.result;

      save();
      applyAppearance();
    };

    reader.readAsDataURL(file);
  };

$("#clearBgImage").onclick =
  () => {
    state.customBg = "";

    if ($("#bgImageInput")) {
      $("#bgImageInput").value =
        "";
    }

    save();
    applyAppearance();
  };

$("#resetTheme").onclick =
  () => {
    state.theme =
      "lavender";

    state.bg =
      "clean";

    state.customBg =
      "";

    state.fontColor =
      "#17204a";

    state.barColor =
      "#ffffff";

    state.barOpacity =
      82;

    save();
    render();
  };

$("#soundInput").onchange =
  (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      openInfo(
        "Audio file too large",
        "Please choose an audio file under 8 MB."
      );

      event.target.value =
        "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      state.sound =
        reader.result;

      save();
      render();
    };

    reader.readAsDataURL(file);
  };

$("#testSound").onclick =
  playSound;

$("#clearSound").onclick =
  () => {
    state.sound = "";

    save();
    render();
  };

$("#notificationBtn").onclick =
  async () => {
    if ("Notification" in window) {
      const permission =
        await Notification.requestPermission();

      $("#notificationStatus").textContent =
        `Notification permission: ${permission}`;
    } else {
      openInfo(
        "Notifications unavailable",
        "This browser does not support browser notifications."
      );
    }
  };

$("#stopAlarmBtn").onclick =
  () => {
    stopAlarm();
    closeModals();
  };

applyAppearance();
render();
