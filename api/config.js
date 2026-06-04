import { google } from "googleapis";

export default async function handler(req, res) {
  try {

    const course =
      req.query.course || "donut";

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key:
          process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,"\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
      ],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const result =
      await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Courses!A:I",
      });

    const rows =
      result.data.values || [];

    const headers =
      rows[0];

    const dataRows =
      rows.slice(1);

    const row =
      dataRows.find(
        r => r[0] === course
      );

    if (!row) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const config = {};

    headers.forEach((header,index)=>{
      config[header] =
        row[index] || "";
    });

    return res.status(200).json(config);

  } catch(error){

    return res.status(500).json({
      error:error.message
    });

  }
}
