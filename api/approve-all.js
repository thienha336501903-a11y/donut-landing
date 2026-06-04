import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({ error: "Thiếu course" });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Orders!A:F",
    });

    const rows = result.data.values || [];
    const dataRows = rows.slice(1);

    const updates = [];
    const gmails = [];

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2;
      const rowCourse = row[1];
      const gmail = row[3];
      const status = row[5];

      if (rowCourse === course && status === "Chờ duyệt") {
        gmails.push(gmail);

        updates.push({
          range: `Orders!F${rowNumber}`,
          values: [["Đã duyệt"]],
        });
      }
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updates,
        },
      });
    }

    return res.status(200).json({
      success: true,
      count: gmails.length,
      gmails,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
