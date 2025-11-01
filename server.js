import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import brevo from "@getbrevo/brevo";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/book", async (req, res) => {
  try {
    const { name, phone, pickup, drop, date, time, vehicle } = req.body;

    if (!name || !phone || !pickup || !drop) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Example Brevo email
    const client = new brevo.TransactionalEmailsApi();
    client.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    await client.sendTransacEmail({
      sender: { name: "FastPoint Cab", email: "fastpointcab@gmail.com" },
      to: [{ email: "fastpointcab@gmail.com" }],
      subject: "New Taxi Booking",
      htmlContent: `
        <h2>🚖 New Booking Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Pickup:</b> ${pickup}</p>
        <p><b>Drop:</b> ${drop}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p><b>Vehicle:</b> ${vehicle}</p>
      `
    });

    res.status(200).json({ success: true, message: "Booking sent successfully!" });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
