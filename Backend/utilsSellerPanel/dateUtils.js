const getDateRange = (filter) => {
  const now = new Date();
  let start, end = new Date();

  switch (filter) {
    case "today":
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date();
      break;

    case "week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      start = weekStart;
      end = new Date();
      break;

    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      start = monthStart;
      end = new Date();
      break;

    default:
      start = new Date(0); // all-time
  }

  return { start, end };
};

module.exports = { getDateRange };
