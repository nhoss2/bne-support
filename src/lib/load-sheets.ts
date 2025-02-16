const SHEET_ID = "1tZnNh9uXsuEHlBanQasbwVi5I15Z142qCSrHaama6Wk";

export const getSheetCsv = async () => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch services data");
  }

  const csvText = await response.text();

  return csvText;
};
