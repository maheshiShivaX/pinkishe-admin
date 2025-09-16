// 🔹 Utility function to cap date range (max 3 months)
export const enforceMaxRange = (start, end) => {
  if (!start || !end) return end;
  const maxEnd = dayjs(start).add(3, "month").endOf("day");
  return dayjs(end).isAfter(maxEnd) ? maxEnd.toDate() : end;
};