import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Brevo from "@getbrevo/brevo";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static frontend
app.use(express.static("public"));

// ✅ Booking API endpoint
app.post("/api/book", async (req, res) => {
  try {
    const { name, phone, pickup, drop, date, time, vehicle } = req.body;

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing BREVO_API_KEY in .env file!");
      return res.status(500).json({ message: "Server error: Missing API key." });
    }

    const defaultClient = Brevo.ApiClient.instance;
    defaultClient.authentications["api-key"].apiKey = apiKey;

    const apiInstance = new Brevo.TransactionalEmailsApi();
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

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.status(200).json({ message: "Booking email sent successfully!" });
  } catch (error) {
    console.error("❌ Email send error:", error?.response?.body || error);
    res.status(500).json({ message: "Failed to send booking." });
  }
});

// ✅ Export the app (important for Vercel)
export default app;
