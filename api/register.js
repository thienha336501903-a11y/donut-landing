import { google } from "googleapis";
import { v2 as cloudinary } from "cloudinary";

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed",
});
}

try {
const { gmail, billName, billType, billData } = req.body;

```
if (!gmail || !billName || !billType || !billData) {
  return res.status(400).json({
    error: "Thiếu dữ liệu",
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadResult = await cloudinary.uploader.upload(
  `data:${billType};base64,${billData}`,
  {
    folder: "bill-chuyen-khoan",
    public_id: `${Date.now()}-${billName.replace(/\.[^/.]+$/, "")}`,
    resource_type: "image",
  }
);

const billLink = uploadResult.secure_url;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

const time = new Date().toLocaleString("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
});

await sheets.spreadsheets.values.append({
  spreadsheetId: process.env.GOOGLE_SHEET_ID,
  range: "Sheet1!A:D",
  valueInputOption: "RAW",
  requestBody: {
    values: [
      [
        time,
        gmail,
        billLink,
        "Chờ duyệt",
      ],
    ],
  },
});

return res.status(200).json({
  success: true,
  file: billLink,
});
```

} catch (error) {
console.error("REGISTER_ERROR:", error);

```
return res.status(500).json({
  error: error.message,
  stack: error.stack,
});
```

}
}
