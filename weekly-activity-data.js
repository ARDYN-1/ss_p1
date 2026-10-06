/*
 * Weekly activity source backed by the authenticated FastAPI endpoint.
 */
(() => {
  window.soulspaceWeeklyActivityProvider = {
    sourceLabel: 'Your activity',
    async getActiveDates() {
      const response = await fetch('/api/activity/weekly', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Weekly activity request failed (${response.status})`);
      const result = await response.json();
      if (!result || !Array.isArray(result.days) || result.days.length !== 7) {
        throw new TypeError('Weekly activity response must contain exactly seven days.');
      }
      return result.days.filter((day) => day && day.active === true).map((day) => day.date);
    },
  };
})();
