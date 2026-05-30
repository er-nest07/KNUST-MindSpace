import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import twilio from "twilio";
import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sendAuditMessages() {
  try {
    console.log("Sending morning audit messages...");

    const { data: users, error } = await supabase
      .from("profiles")
      .select("phone_number");

    if (error) throw error;

    for (const user of users) {
      if (!user.phone_number) continue;

      await client.messages.create({
        from: "whatsapp:+14155238886",
        to: `whatsapp:${user.phone_number}`,
        body: `
        🌿 Daily Wellness Audit

        Good evening ${user.display_name}

        Take today’s quick
        https://yourwebsite.com/audit
        Your responses are private 💚
        `,
      });

      console.log(`Message sent to ${user.phone_number}`);
    }

    console.log("All messages sent.");
  } catch (err) {
    console.error(err);
  }
}

cron.schedule("0 17 * * *", () => {
  sendAuditMessages();
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

sendAuditMessages();