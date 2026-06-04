import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const course = req.query.course || "donut";

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
      range: "Courses!A:I",
    });

    const rows = result.data.values || [];

    if (rows.length < 2) {
      return res.status(404).json({
        error: "Chưa có dữ liệu trong tab Courses",
      });
    }

    const headers = rows[0].map((h) => String(h).trim());
    const dataRows = rows.slice(1);

    const targetRow = dataRows.find((row) => {
      return String(row[0] || "").trim() === course;
    });

    if (!targetRow) {
      return res.status(404).json({
        error: `Không tìm thấy khóa học: ${course}`,
      });
    }

    const config = {};

    headers.forEach((header, index) => {
      config[header] = targetRow[index] || "";
    });

    return res.status(200).json(config);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
