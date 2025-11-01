import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Brevo from "@getbrevo/brevo";

// Load environment variables from .env
dotenv.config();

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve frontend static files (HTML, CSS, JS)
app.use(express.static("public"));

// ✅ Booking API endpoint
app.post("/api/book", async (req, res) => {
  try {
    const { name, phone, pickup, drop, date, time, vehicle } = req.body;

    // ✅ Check if API key exists
    const defaultClient = Brevo.ApiClient.instance;
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing BREVO_API_KEY in .env file!");
      return res.status(500).json({ message: "Server error: Missing API key." });
    }

    defaultClient.authentications["api-key"].apiKey = apiKey;

    console.log("🔑 API Key Loaded:", apiKey.slice(0, 8) + "********");

    const apiInstance = new Brevo.TransactionalEmailsApi();

    // ✅ Email content
    const sendSmtpEmail = {
      sender: { name: "FastPoint Cab", email: "fastpointcab@gmail.com" },
      to: [{ email: "fastpointcab@gmail.com" }],
      subject: `🚕 New Taxi Booking from ${name}`,
      htmlContent: `
        <h3>New Taxi Booking Details</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Pickup:</b> ${pickup}</p>
        <p><b>Drop:</b> ${drop}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p><b>Vehicle:</b> ${vehicle || "Not selected"}</p>
      `,
    };

    // ✅ Send the email via Brevo API
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("📨 Email sent successfully:", result.messageId || result);

    res.status(200).json({ message: "Booking email sent successfully!" });
  } catch (error) {
    console.error("❌ Email send error:", error?.response?.body || error);
    res.status(500).json({ message: "Failed to send booking." });
  }
});

// ✅ Start the Express server
app.listen(port, () => {
  console.log(`🚗 Server running at http://localhost:${port}`);
});
