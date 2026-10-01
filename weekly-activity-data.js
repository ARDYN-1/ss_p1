/*
 * Demo activity source. Replace getActiveDates() with a Django request later.
 * Its response only needs to be an array of date-only strings (YYYY-MM-DD)
 * for days with at least one activity in the current local Monday-Sunday week.
 * Activity type and count are intentionally not part of this interface.
 */
(() => {
  const activeWeekdays = [0, 1, 3, 4, 6];

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
    async getActiveDates() {
      const weekStart = getMonday(new Date());
      return activeWeekdays.map((offset) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + offset);
        return toIsoDate(date);
      });
    },
  };
})();