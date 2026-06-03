import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { gmail, billName, billType, billData } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    const buffer = Buffer.from(billData, "base64");

    const uploadedFile = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${billName}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: billType,
        body: require("stream").Readable.from(buffer),
      },
      fields: "webViewLink",
    });

    const time = new Date().toLocaleString("vi-VN");

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:D",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            time,
            gmail,
            uploadedFile.data.webViewLink,
            "Chờ duyệt",
          ],
        ],
      },
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
