const toast = document.querySelector('.toast');
const guidanceDialog = document.querySelector('.guidance-dialog');
const recommendation = document.querySelector('.recommendation');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

document.querySelectorAll('.explore-button').forEach((button) => {
  button.addEventListener('click', () => {
    const practice = button.closest('.practice-card').dataset.practice;
    showToast(`${practice} selected — take this moment at your own pace.`);
  });
});

document.querySelector('.guidance-button').addEventListener('click', () => {
  recommendation.hidden = true;
  guidanceDialog.showModal();
});

const suggestions = {
  calm: { practice: 'Breathwork', detail: 'A few slow breaths can help you find a steadier rhythm.' },
  energy: { practice: 'Yoga & movement', detail: 'A little gentle movement can help you reconnect with your energy.' },
  rest: { practice: 'Sleep Stories', detail: 'Let a quiet story help you set the day down for a while.' },
};

document.querySelectorAll('.mood-option').forEach((button) => {
  button.addEventListener('click', () => {
    const suggestion = suggestions[button.dataset.mood];
    recommendation.innerHTML = `<span class="recommendation-label">A GENTLE SUGGESTION</span><strong>${suggestion.practice}</strong><span>${suggestion.detail}</span><button class="recommendation-link" type="button">Explore this practice <span aria-hidden="true">→</span></button>`;
    recommendation.hidden = false;
    recommendation.querySelector('.recommendation-link').addEventListener('click', () => {
      guidanceDialog.close();
      document.querySelector(`[data-practice="${suggestion.practice}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast(`${suggestion.practice} is ready when you are.`);
    });
  });
});
