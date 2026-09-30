/*
 * Demo activity source. When the Django endpoint is ready, replace getWeek()
 * with a fetch call that returns the same shape:
 * { weekStart: "YYYY-MM-DD", days: [{ date: "YYYY-MM-DD", minutes: 18, practiceCount: 2 }] }
 * Keep this interface stable so the chart renderer does not need to change.
 */
(() => {
  const demoDays = [
    { minutes: 18, practiceCount: 2 },
    { minutes: 32, practiceCount: 3 },
    { minutes: 12, practiceCount: 1 },
    { minutes: 0, practiceCount: 0 },
    { minutes: 25, practiceCount: 2 },
    { minutes: 40, practiceCount: 3 },
    { minutes: 16, practiceCount: 2 },
  ];

  function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getMonday(date) {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return monday;
  }

  window.soulspaceWeeklyActivityProvider = {
    sourceLabel: 'Demo data',
    async getWeek() {
      const weekStart = getMonday(new Date());
      return {
        weekStart: toIsoDate(weekStart),
        days: demoDays.map((activity, index) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + index);
          return { date: toIsoDate(date), ...activity };
        }),
      };
    },
  };
})();