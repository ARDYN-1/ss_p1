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
const weeklyDays = document.querySelector('#weekly-days');
const weeklyActiveDays = document.querySelector('#weekly-active-days');
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
  Reflection: { name: 'Quiet Reflection', card: 'Quiet Reflection', detail: 'A few minutes of reflection can help you reconnect with what matters to you.' },
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

function getMonday(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function validateActiveDates(activeDates) {
  if (!Array.isArray(activeDates)) {
    throw new TypeError('Weekly activity must be a list of active dates.');
  }

  const today = new Date();
  const todayIso = formatIsoDate(today);
  const weekStart = getMonday(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const firstDate = formatIsoDate(weekStart);
  const lastDate = formatIsoDate(weekEnd);
  const activeDateSet = new Set();

  activeDates.forEach((value) => {
    const date = parseIsoDate(value);
    const isoDate = formatIsoDate(date);
    if (isoDate < firstDate || isoDate > lastDate) {
      throw new RangeError('Weekly activity dates must fall within the current Monday-to-Sunday week.');
    }
    activeDateSet.add(isoDate);
  });

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const isoDate = formatIsoDate(date);
    return {
      date,
      isActive: activeDateSet.has(isoDate),
      isToday: isoDate === todayIso,
    };
  });

  return days;
}

function renderWeeklyActivity(days, sourceLabel) {
  const activeDayCount = days.filter((day) => day.isActive).length;
  const formatLongDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const formatWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

  document.querySelector('#activity-source').textContent = (sourceLabel || 'Activity data').toUpperCase();
  weeklyActiveDays.textContent = `${activeDayCount} / 7`;
  weeklyDays.replaceChildren();

  days.forEach((day) => {
    const item = document.createElement('div');
    item.className = 'weekly-day';
    item.setAttribute('role', 'listitem');
    item.setAttribute(
      'aria-label',
      `${formatLongDate.format(day.date)}: ${day.isActive ? 'Activity completed.' : 'No activity recorded.'}${day.isToday ? ' Today.' : ''}`,
    );
    if (day.isActive) item.classList.add('is-active');
    if (day.isToday) {
      item.classList.add('is-today');
      item.setAttribute('aria-current', 'date');
    }

    const dot = document.createElement('span');
    dot.className = 'weekly-day-dot';
    dot.setAttribute('aria-hidden', 'true');

    const weekday = document.createElement('span');
    weekday.className = 'weekly-day-name';
    weekday.textContent = formatWeekday.format(day.date);

    const todayLabel = document.createElement('span');
    todayLabel.className = 'weekly-day-today';
    todayLabel.textContent = day.isToday ? 'Today' : '';
    todayLabel.setAttribute('aria-hidden', String(!day.isToday));

    item.append(dot, weekday, todayLabel);
    weeklyDays.append(item);
  });

  weeklyActivityError.hidden = true;
  weeklyActivityData.hidden = false;
}

async function loadWeeklyActivity() {
  try {
    const provider = window.soulspaceWeeklyActivityProvider;
    if (!provider || typeof provider.getActiveDates !== 'function') {
      throw new Error('The weekly activity data provider is not available.');
    }
    const days = validateActiveDates(await provider.getActiveDates());
    renderWeeklyActivity(days, provider.sourceLabel);
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
