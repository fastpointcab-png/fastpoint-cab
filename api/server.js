import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, phone, pickup, drop, date, time, vehicle } = req.body;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "FastPoint Cab", email: "fastpointcab@gmail.com" },
        to: [{ email: "fastpointcab@gmail.com" }],
        subject: "New Taxi Booking",
        htmlContent: `
          <h3>New Booking Request</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Pickup:</strong> ${pickup}</p>
          <p><strong>Drop:</strong> ${drop}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Vehicle:</strong> ${vehicle}</p>
        `
      })
    });

    if (!response.ok) throw new Error("Failed to send email");

    res.status(200).json({ message: "Booking email sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
