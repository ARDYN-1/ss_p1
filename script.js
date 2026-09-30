// Small, unobtrusive interactions keep the static reference design useful as a real page.
const toast = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.querySelectorAll('.explore-button').forEach((button) => {
  button.addEventListener('click', () => {
    const practice = button.closest('.practice-card').dataset.practice;
    showToast(`${practice} practice selected — take a calming breath.`);
  });
});

document.querySelector('.guidance-button').addEventListener('click', () => {
  showToast('Tell us how you feel, and we’ll find a gentle place to begin.');
});

document.querySelectorAll('[data-scroll-to]').forEach((button) => {
  button.addEventListener('click', () => document.getElementById(button.dataset.scrollTo).scrollIntoView());
});
