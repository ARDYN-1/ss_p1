const toast = document.querySelector('.toast');
const themeToggle = document.querySelector('.theme-toggle');
const finderDialog = document.querySelector('.practice-finder-dialog');
const finderStep = document.querySelector('#finder-step');
const finderResults = document.querySelector('#finder-results');
const questionOptions = document.querySelector('#question-options');
const nextButton = document.querySelector('#finder-next');
const backButton = document.querySelector('#finder-back');
const weeklyActivityData = document.querySelector('#weekly-activity-data');
const weeklyActivityError = document.querySelector('#weekly-activity-error');
const weeklyChartAxis = document.querySelector('#weekly-chart-axis');
const weeklyChartGrid = document.querySelector('#weekly-chart-grid');
const weeklyBars = document.querySelector('#weekly-bars');
const weeklyDayLabels = document.querySelector('#weekly-day-labels');
const activityOrder = ['Breathwork', 'Meditation', 'Movement', 'HealingMusic', 'Sleep', 'Gratitude', 'Reflection'];
let toastTimer;
let currentQuestion = 0;
let answers = [];

const activities = {
  Meditation: { name: 'Meditation', card: 'Meditation', detail: 'A quiet pause can give your mind room to settle and refocus.' },
  Breathwork: { name: 'Breathwork', card: 'Breathwork', detail: 'Simple, steady breathing can help you feel more grounded in the moment.' },
  Movement: { name: 'Yoga & movement', card: 'Yoga & movement', detail: 'Gentle movement can release tension and help you reconnect with your energy.' },
  HealingMusic: { name: 'Healing music', card: 'Healing Music', detail: 'Soothing sounds can make it easier to unwind and find a calmer rhythm.' },
  Sleep: { name: 'Sleep stories', card: 'Sleep Stories', detail: 'A gentle story can help you slow down and prepare for rest.' },
  Gratitude: { name: 'Gratitude', card: 'Gratitude', detail: 'Noticing what is already good can bring a little perspective to your day.' },
  Reflection: { name: 'Quiet reflection', card: 'Spiritual Reflection', detail: 'A few minutes of reflection can help you reconnect with what matters to you.' },
};

const questions = [
  {
    title: 'How are you feeling right now?',
    description: 'Start wherever you are. There is no right or wrong answer.',
    options: [
      { title: 'A little overwhelmed', hint: 'My mind could use some quiet.', scores: { Breathwork: 3, Meditation: 2, Reflection: 1 } },
      { title: 'Low on energy', hint: 'I could use a gentle lift.', scores: { Movement: 2, HealingMusic: 2, Gratitude: 1 } },
      { title: 'Tense or restless', hint: 'I have some energy I need to settle.', scores: { Movement: 2, Breathwork: 2, Meditation: 1 } },
      { title: 'Ready to wind down', hint: 'I feel tired and want to rest.', scores: { Sleep: 3, HealingMusic: 2 } },
      { title: 'Pretty good, just checking in', hint: 'I would like to stay present.', scores: { Gratitude: 3, Reflection: 2, Meditation: 1 } },
    ],
  },
  {
    title: 'What would you like a little more of?',
    description: 'Think about what would feel most helpful in this moment.',
    options: [
      { title: 'Calm', hint: 'A softer, steadier feeling.', scores: { Meditation: 2, Breathwork: 2, HealingMusic: 1 } },
      { title: 'Energy', hint: 'A small spark to get moving.', scores: { Movement: 3, Gratitude: 1 } },
      { title: 'Rest', hint: 'Permission to slow everything down.', scores: { Sleep: 3, HealingMusic: 2 } },
      { title: 'Clarity', hint: 'A little space to sort things out.', scores: { Reflection: 3, Meditation: 1 } },
      { title: 'Connection', hint: 'A reminder of what feels meaningful.', scores: { Gratitude: 3, Reflection: 2 } },
    ],
  },
  {
    title: 'How does your body feel?',
    description: 'A quick body check can help narrow down what might feel good.',
    options: [
      { title: 'Restless', hint: 'I want to move or shift around.', scores: { Movement: 3, Breathwork: 1 } },
      { title: 'A bit tight', hint: 'I am holding some tension.', scores: { Breathwork: 2, Movement: 2 } },
      { title: 'Heavy or sleepy', hint: 'I am ready to recharge.', scores: { Sleep: 3, HealingMusic: 1 } },
      { title: 'Sluggish', hint: 'A gentle nudge might help.', scores: { Movement: 3, Gratitude: 1 } },
      { title: 'Mostly at ease', hint: 'I can take a quiet pause.', scores: { Meditation: 2, Reflection: 1, Gratitude: 1 } },
    ],
  },
  {
    title: 'Which kind of practice sounds best?',
    description: 'Go with the first one that feels inviting.',
    options: [
      { title: 'Slow, steady breathing', hint: 'Something simple to follow.', scores: { Breathwork: 3 }, favorite: 'Breathwork' },
      { title: 'Gentle movement', hint: 'A stretch or a change of pace.', scores: { Movement: 3 }, favorite: 'Movement' },
      { title: 'Soothing sounds', hint: 'I would rather listen than do.', scores: { HealingMusic: 3 }, favorite: 'HealingMusic' },
      { title: 'A quiet moment', hint: 'Space to sit and be still.', scores: { Meditation: 3 }, favorite: 'Meditation' },
      { title: 'A thoughtful pause', hint: 'Time to reflect and notice.', scores: { Reflection: 2, Gratitude: 1 }, favorite: 'Reflection' },
    ],
  },
  {
    title: 'How much time do you have?',
    description: 'A small moment counts, however long it is.',
    options: [
      { title: 'Just a couple of minutes', hint: 'Keep it short and simple.', scores: { Breathwork: 2, Gratitude: 2 } },
      { title: 'Around five minutes', hint: 'Enough time to settle in.', scores: { Meditation: 2, Reflection: 2, Breathwork: 1 } },
      { title: 'Ten minutes or more', hint: 'I have a little space to explore.', scores: { Movement: 2, Sleep: 2, HealingMusic: 1 } },
    ],
  },
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function parseIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError('Weekly activity dates must use YYYY-MM-DD format.');
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new TypeError(`Invalid weekly activity date: ${value}`);
  }
  return date;
}

function formatIsoDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function validateWeeklyActivity(week) {
  if (!week || !Array.isArray(week.days) || week.days.length !== 7) {
    throw new TypeError('Weekly activity must contain exactly seven days.');
  }
  const weekStart = parseIsoDate(week.weekStart);
  if (weekStart.getDay() !== 1) throw new TypeError('Weekly activity must start on a Monday.');

  const days = week.days.map((entry, index) => {
    const date = parseIsoDate(entry.date);
    const expectedDate = new Date(weekStart);
    expectedDate.setDate(expectedDate.getDate() + index);
    if (formatIsoDate(date) !== formatIsoDate(expectedDate)) {
      throw new TypeError('Weekly activity dates must run Monday through Sunday without gaps.');
    }
    if (!Number.isFinite(entry.minutes) || entry.minutes < 0) {
      throw new TypeError('Daily practice minutes must be a non-negative number.');
    }
    if (!Number.isInteger(entry.practiceCount) || entry.practiceCount < 0) {
      throw new TypeError('Daily practice counts must be non-negative whole numbers.');
    }
    return { date, minutes: entry.minutes, practiceCount: entry.practiceCount };
  });

  return { weekStart, days };
}

function appendWeeklyAxisLabels(tickStep) {
  weeklyChartAxis.replaceChildren();
  weeklyChartGrid.replaceChildren();
  for (let index = 0; index <= 4; index += 1) {
    const value = tickStep * (4 - index);
    const position = index * 25;
    const label = document.createElement('span');
    label.className = 'weekly-axis-label';
    label.textContent = String(value);
    label.style.top = `${position}%`;
    if (index === 0) label.classList.add('is-top');
    if (index === 4) label.classList.add('is-bottom');
    weeklyChartAxis.append(label);

    const line = document.createElement('span');
    line.className = 'weekly-grid-line';
    line.style.top = `${position}%`;
    if (index === 0) line.classList.add('is-top');
    if (index === 4) line.classList.add('is-bottom');
    weeklyChartGrid.append(line);
  }
}

function renderWeeklyActivity(week, sourceLabel) {
  const totalMinutes = week.days.reduce((total, day) => total + day.minutes, 0);
  const totalPractices = week.days.reduce((total, day) => total + day.practiceCount, 0);
  const activeDays = week.days.filter((day) => day.minutes > 0 || day.practiceCount > 0).length;
  const maxMinutes = Math.max(...week.days.map((day) => day.minutes));
  const tickStep = Math.max(15, Math.ceil(maxMinutes / 4 / 15) * 15);
  const chartMaximum = tickStep * 4;
  const endOfWeek = new Date(week.weekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const formatRangeDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

  document.querySelector('#activity-source').textContent = (sourceLabel || 'Activity data').toUpperCase();
  document.querySelector('#weekly-minutes').textContent = String(totalMinutes);
  document.querySelector('#weekly-active-days').textContent = `${activeDays} / 7`;
  document.querySelector('#weekly-practices').textContent = String(totalPractices);
  document.querySelector('#weekly-date-range').textContent =
    `${formatRangeDate.format(week.weekStart)} – ${formatRangeDate.format(endOfWeek)}${week.weekStart.getFullYear() === endOfWeek.getFullYear() ? `, ${endOfWeek.getFullYear()}` : `, ${week.weekStart.getFullYear()} – ${endOfWeek.getFullYear()}`}`;
  appendWeeklyAxisLabels(tickStep);
  weeklyBars.replaceChildren();
  weeklyDayLabels.replaceChildren();

  const formatLongDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const formatWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

  week.days.forEach((day) => {
    const percentage = chartMaximum === 0 ? 0 : (day.minutes / chartMaximum) * 100;
    const practiceWord = day.practiceCount === 1 ? 'practice' : 'practices';
    const description = `${formatLongDate.format(day.date)}: ${day.minutes} ${day.minutes === 1 ? 'minute' : 'minutes'} practiced, ${day.practiceCount} ${practiceWord}.`;

    const column = document.createElement('div');
    column.className = 'weekly-bar-column';
    column.setAttribute('role', 'listitem');
    column.setAttribute('aria-label', description);
    column.title = description;
    if (day.minutes === 0) column.classList.add('no-activity');

    const track = document.createElement('div');
    track.className = 'weekly-bar-track';
    const fill = document.createElement('span');
    fill.className = 'weekly-bar-fill';
    fill.style.height = `${percentage}%`;
    const minutes = document.createElement('span');
    minutes.className = 'weekly-bar-value';
    minutes.textContent = `${day.minutes}m`;
    minutes.style.bottom = `calc(${percentage}% + 6px)`;
    track.append(fill, minutes);
    column.append(track);
    weeklyBars.append(column);

    const label = document.createElement('div');
    label.className = 'weekly-day-label';
    label.setAttribute('role', 'presentation');
    const weekday = document.createElement('span');
    weekday.className = 'weekly-day-name';
    weekday.textContent = formatWeekday.format(day.date);
    const count = document.createElement('span');
    count.className = 'weekly-day-count';
    count.textContent = day.practiceCount > 0 ? `${day.practiceCount} ${day.practiceCount === 1 ? 'session' : 'sessions'}` : 'Rest day';
    label.append(weekday, count);
    weeklyDayLabels.append(label);
  });

  weeklyActivityError.hidden = true;
  weeklyActivityData.hidden = false;
}

async function loadWeeklyActivity() {
  try {
    const provider = window.soulspaceWeeklyActivityProvider;
    if (!provider || typeof provider.getWeek !== 'function') {
      throw new Error('The weekly activity data provider is not available.');
    }
    const activity = validateWeeklyActivity(await provider.getWeek());
    renderWeeklyActivity(activity, provider.sourceLabel);
  } catch (error) {
    console.error('Unable to load weekly activity:', error);
    weeklyActivityData.hidden = true;
    weeklyActivityError.textContent = 'Weekly activity could not be loaded. Please try again later.';
    weeklyActivityError.hidden = false;
  }
}

function applyTheme(theme, persist = false) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  themeToggle.querySelector('[data-theme-name]').textContent = isDark ? 'Dark' : 'Light';
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#151c18' : '#f8f8f4';
  if (persist) {
    try {
      localStorage.setItem('soulspace-theme', isDark ? 'dark' : 'light');
    } catch {
      // The theme still applies for this page view when storage is unavailable.
    }
  }
}

let storedTheme = null;
try {
  storedTheme = localStorage.getItem('soulspace-theme');
} catch {
  // Use the browser preference when storage is unavailable.
}
const initialTheme = storedTheme === 'dark' || storedTheme === 'light'
  ? storedTheme
  : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(initialTheme);
themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
});

document.querySelectorAll('.explore-button').forEach((button) => {
  button.addEventListener('click', () => {
    const practice = button.closest('.practice-card').dataset.practice;
    showToast(`${practice} selected — take this moment at your own pace.`);
  });
});

function renderQuestion() {
  const question = questions[currentQuestion];
  document.querySelector('#question-counter').textContent = `QUESTION ${currentQuestion + 1} OF ${questions.length}`;
  document.querySelector('#question-percent').textContent = `${Math.round(((currentQuestion + 1) / questions.length) * 100)}%`;
  const progress = document.querySelector('.progress-track');
  progress.setAttribute('aria-valuenow', String(currentQuestion + 1));
  progress.querySelector('.progress-fill').style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  document.querySelector('#finder-title').textContent = question.title;
  document.querySelector('#finder-description').textContent = question.description;
  questionOptions.querySelectorAll('.answer-option').forEach((option) => option.remove());

  question.options.forEach((option, index) => {
    const label = document.createElement('label');
    label.className = 'answer-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `question-${currentQuestion}`;
    input.value = String(index);
    input.checked = answers[currentQuestion] === option;
    const radioMark = document.createElement('span');
    radioMark.className = 'answer-radio';
    radioMark.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    copy.className = 'answer-copy';
    const title = document.createElement('strong');
    title.textContent = option.title;
    const hint = document.createElement('small');
    hint.textContent = option.hint;
    copy.append(title, hint);
    label.append(input, radioMark, copy);
    if (input.checked) label.classList.add('selected');
    input.addEventListener('change', () => {
      answers[currentQuestion] = option;
      questionOptions.querySelectorAll('.answer-option').forEach((item) => item.classList.remove('selected'));
      label.classList.add('selected');
      nextButton.disabled = false;
    });
    questionOptions.append(label);
  });

  backButton.hidden = currentQuestion === 0;
  nextButton.disabled = !answers[currentQuestion];
  nextButton.innerHTML = currentQuestion === questions.length - 1
    ? 'See my recommendation <span aria-hidden="true">→</span>'
    : 'Next question <span aria-hidden="true">→</span>';
}

function findBestPractice() {
  const scores = Object.fromEntries(activityOrder.map((activity) => [activity, 0]));
  answers.forEach((answer) => {
    Object.entries(answer.scores).forEach(([activity, points]) => {
      if (Object.hasOwn(scores, activity)) scores[activity] += points;
    });
  });
  const preferred = answers[3].favorite;
  const bestActivity = [...activityOrder].sort((first, second) => {
    const scoreDifference = scores[second] - scores[first];
    if (scoreDifference) return scoreDifference;
    if (first === preferred) return -1;
    if (second === preferred) return 1;
    return activityOrder.indexOf(first) - activityOrder.indexOf(second);
  })[0];
  return activities[bestActivity];
}

function showResult() {
  const result = findBestPractice();
  document.querySelector('#result-summary').textContent =
    `We matched your answers across how you feel, what you want more of, your energy, the kind of activity you prefer, and the time you have.`;
  document.querySelector('#result-practice').textContent = result.name;
  document.querySelector('#result-detail').textContent = result.detail;
  document.querySelector('#result-action').onclick = () => {
    finderDialog.close();
    const card = [...document.querySelectorAll('.practice-card')].find((item) => item.dataset.practice === result.card);
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast(`${result.name} is ready when you are.`);
  };
  finderStep.hidden = true;
  document.querySelector('#finder-progress').hidden = true;
  finderResults.hidden = false;
  document.querySelector('#finder-restart').focus();
}

function startFinder() {
  currentQuestion = 0;
  answers = Array(questions.length).fill(null);
  finderStep.hidden = false;
  finderResults.hidden = true;
  document.querySelector('#finder-progress').hidden = false;
  renderQuestion();
  finderDialog.showModal();
}

document.querySelectorAll('[data-open-finder]').forEach((button) => button.addEventListener('click', startFinder));
nextButton.addEventListener('click', () => {
  if (!answers[currentQuestion]) return;
  if (currentQuestion === questions.length - 1) {
    showResult();
    return;
  }
  currentQuestion += 1;
  renderQuestion();
});
backButton.addEventListener('click', () => {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
  }
});
document.querySelector('#finder-restart').addEventListener('click', () => {
  currentQuestion = 0;
  answers = Array(questions.length).fill(null);
  finderResults.hidden = true;
  finderStep.hidden = false;
  document.querySelector('#finder-progress').hidden = false;
  renderQuestion();
});

renderQuestion();
loadWeeklyActivity();
