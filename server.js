import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import Brevo from "@getbrevo/brevo";

// Load .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve your frontend files

// ✅ Booking API
app.post("/api/book", async (req, res) => {
  const { name, phone, pickup, drop, date, time, vehicle } = req.body;

  try {
    // 🔑 Load API key from .env
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing BREVO_API_KEY in .env file!");
      return res.status(500).json({ message: "Missing API key." });
    }

    const defaultClient = Brevo.ApiClient.instance;
    defaultClient.authentications["api-key"].apiKey = apiKey;

    const apiInstance = new Brevo.TransactionalEmailsApi();

    // ✉️ Prepare email
    const emailData = {
      sender: { name: "FastPoint Cab", email: "fastpointcab@gmail.com" },
      to: [{ email: "fastpointcab@gmail.com" }],
      subject: `🚕 New Booking from ${name}`,
      htmlContent: `
        <h2>New Taxi Booking</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Pickup:</b> ${pickup}</p>
        <p><b>Drop:</b> ${drop}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p><b>Vehicle:</b> ${vehicle || "Not selected"}</p>
      `,
    };

    // ✅ Send email
    const result = await apiInstance.sendTransacEmail(emailData);
    console.log("📨 Email sent successfully:", result.messageId || result);

    res.status(200).json({ message: "Booking email sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.body || error);
    res.status(500).json({ message: "Failed to send booking." });
  }
});

// ✅ Start local server
app.listen(port, () => {
  console.log(`🚗 Server running at http://localhost:${port}`);
});
