export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { password } = req.body;
    const systemPassword = process.env.ADMIN_PASSWORD;

    if (!systemPassword) {
      return res.status(500).json({ success: false, message: "Hệ thống chưa cài đặt mật khẩu môi trường." });
    }

    if (password === systemPassword) {
      return res.status(200).json({ success: true, message: "Mật khẩu chính xác!" });
    } else {
      return res.status(401).json({ success: false, message: "Sai mật khẩu!" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
