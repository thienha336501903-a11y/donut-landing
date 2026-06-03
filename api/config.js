import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Config!A:B",
    });

    const rows = result.data.values || [];
    const config = {};

    rows.forEach((row) => {
      const key = row[0];
      const value = row[1];
      if (key) config[key] = value || "";
    });

    return res.status(200).json(config);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
