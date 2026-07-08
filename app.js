const queueItems = [
  {
    id: 1,
    sender: "Avery Johnson",
    subject: "Partnership proposal follow-up",
    priority: "high",
    due: "Overdue by 3h",
    dueType: "overdue",
  },
  {
    id: 2,
    sender: "Billing @ Orbital",
    subject: "Invoice discrepancy Q3",
    priority: "high",
    due: "Due in 1h",
    dueType: "today",
  },
  {
    id: 3,
    sender: "Hiring Team",
    subject: "Candidate referral response",
    priority: "medium",
    due: "Due today",
    dueType: "today",
  },
  {
    id: 4,
    sender: "Product Feedback",
    subject: "Feature request from enterprise customer",
    priority: "medium",
    due: "Due tomorrow",
    dueType: "all",
  },
  {
    id: 5,
    sender: "Community Newsletter",
    subject: "Question about sponsorship slots",
    priority: "low",
    due: "Due tomorrow",
    dueType: "all",
  },
];

const mailboxHealth = [
  { name: "Support Inbox", handled: 78 },
  { name: "Sales Inbox", handled: 66 },
  { name: "Founder Inbox", handled: 54 },
];

const automations = [
  { name: "Auto-label billing tickets", status: "Active", note: "Matched 11 emails today" },
  { name: "Snooze newsletters", status: "Active", note: "Reduced inbox volume by 27%" },
  { name: "VIP escalation", status: "Paused", note: "Needs routing review" },
];

const activityFeed = [
  { title: "Reply sent to Orbital billing", meta: "4 min ago" },
  { title: "Template 'Follow-up: Proposal' updated", meta: "19 min ago" },
  { title: "Automation 'SLA Nudges' triggered 6 times", meta: "42 min ago" },
  { title: "Support inbox synced", meta: "1h ago" },
];

const state = {
  filter: "all",
  query: "",
  queue: [...queueItems],
};

const queueBody = document.querySelector("#queue-body");
const healthList = document.querySelector("#health-list");
const automationList = document.querySelector("#automation-list");
const activityList = document.querySelector("#activity-list");
const searchInput = document.querySelector("#search-input");
const syncTime = document.querySelector("#sync-time");
const syncBtn = document.querySelector("#sync-btn");
const composeForm = document.querySelector("#compose-form");
const composeFeedback = document.querySelector("#compose-feedback");
const filterButtons = document.querySelectorAll(".chip");

function updateMetrics() {
  const unread = state.queue.length * 3 + 14;
  const dueToday = state.queue.filter((item) => item.dueType === "today" || item.dueType === "overdue").length;
  const activeAutomations = automations.filter((item) => item.status === "Active").length;

  document.querySelector("#metric-unread").textContent = unread.toString();
  document.querySelector("#metric-today").textContent = dueToday.toString();
  document.querySelector("#metric-response-time").textContent = "2.8h";
  document.querySelector("#metric-automations").textContent = activeAutomations.toString();
}

function filteredQueue() {
  return state.queue.filter((item) => {
    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "today" && (item.dueType === "today" || item.dueType === "overdue")) ||
      (state.filter === "overdue" && item.dueType === "overdue");
    const searchTarget = `${item.sender} ${item.subject}`.toLowerCase();
    const matchesQuery = searchTarget.includes(state.query.toLowerCase());
    return matchesFilter && matchesQuery;
  });
}

function renderQueue() {
  const rows = filteredQueue();
  if (!rows.length) {
    queueBody.innerHTML = `
      <tr>
        <td colspan="5" class="muted">No emails match your current filter.</td>
      </tr>
    `;
    return;
  }

  queueBody.innerHTML = rows
    .map(
      (item) => `
      <tr>
        <td>${item.sender}</td>
        <td>${item.subject}</td>
        <td><span class="badge ${item.priority}">${item.priority.toUpperCase()}</span></td>
        <td>${item.due}</td>
        <td><button class="btn secondary resolve-btn" data-id="${item.id}">Resolve</button></td>
      </tr>`
    )
    .join("");
}

function renderHealth() {
  healthList.innerHTML = mailboxHealth
    .map(
      (item) => `
      <li class="health-item">
        <strong>${item.name}</strong>
        <span class="muted">${item.handled}% handled within SLA</span>
        <div class="progress"><span style="width:${item.handled}%"></span></div>
      </li>`
    )
    .join("");
}

function renderAutomations() {
  automationList.innerHTML = automations
    .map(
      (item) => `
      <li class="automation-item">
        <strong>${item.name} • ${item.status}</strong>
        <p>${item.note}</p>
      </li>`
    )
    .join("");
}

function renderActivity() {
  activityList.innerHTML = activityFeed
    .map(
      (item) => `
      <li class="activity-item">
        <strong>${item.title}</strong>
        <p>${item.meta}</p>
      </li>`
    )
    .join("");
}

function setActiveFilter(filter) {
  state.filter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
  renderQueue();
}

function addActivity(title, meta = "just now") {
  activityFeed.unshift({ title, meta });
  if (activityFeed.length > 8) {
    activityFeed.pop();
  }
  renderActivity();
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.classList.contains("resolve-btn")) {
    const emailId = Number(target.dataset.id);
    state.queue = state.queue.filter((item) => item.id !== emailId);
    addActivity(`Marked email #${emailId} as resolved`);
    updateMetrics();
    renderQueue();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveFilter(button.dataset.filter || "all"));
});

searchInput.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    state.query = target.value;
    renderQueue();
  }
});

syncBtn.addEventListener("click", () => {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  syncTime.textContent = `Last synced: ${timestamp}`;
  addActivity("Inboxes synced manually");
});

composeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const to = document.querySelector("#compose-to");
  const subject = document.querySelector("#compose-subject");
  const message = document.querySelector("#compose-message");

  if (!(to instanceof HTMLInputElement) || !(subject instanceof HTMLInputElement) || !(message instanceof HTMLTextAreaElement)) {
    return;
  }

  composeFeedback.textContent = `Draft queued for ${to.value} (${subject.value}).`;
  addActivity(`Queued draft: ${subject.value}`);
  to.value = "";
  subject.value = "";
  message.value = "";
});

function init() {
  renderQueue();
  renderHealth();
  renderAutomations();
  renderActivity();
  updateMetrics();
}

init();
