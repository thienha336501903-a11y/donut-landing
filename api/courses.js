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

    const sheets = google.sheets({ version: "v4", auth });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Courses!A:I",
    });

    const rows = result.data.values || [];
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    const courses = dataRows.map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[String(header).trim()] = row[index] || "";
      });
      return item;
    });

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
