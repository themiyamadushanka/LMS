const express = require('express');
const router = express.Router();
const conn = require('./connectDB');
const {Redis} = require('@upstash/redis');
const {Resend }= require("resend");
require('dotenv').config();

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});
const resend = new Resend(process.env.RESEND_API);



router.post("/", async (req, res) => {
    try {
        const { email, sid, password } = req.body;
        if (!email || !sid || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Save user data temporarily in Redis with email as key (matches verifyOTP)
        await redis.set(`signup:${email}`, { email, sid, password }, { ex: 600 });
        res.status(200).json({ message: "User data saved temporarily" });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/verifyOTP', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // 1. Get user data saved during signup
        const userData = await redis.get(`signup:${email}`);
        if (!userData) {
            return res.status(400).json({ message: "Signup session expired. Please sign up again." });
        }

        // 2. Get OTP sent to email (from reqOTP.js)
        const storedOTP = await redis.get(email);
        
        if (Number(storedOTP) === Number(otp)) {
            // OTP is correct, insert into DB using a Promise wrapper since conn is callback-based
            await new Promise((resolve, reject) => {
                conn.query('INSERT INTO user (email, sid, password) VALUES (?, ?, ?)', 
                [userData.email, userData.sid, userData.password], 
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            // Send Welcome Email asynchronously
                            const emailResponse = await resend.emails.send({
                                from: "OMIXELO <verify@omixelo.com>",
                                to: [userData.email],
                                subject: "Welcome to OMIXELO!",
                                html: `
                                  <!DOCTYPE html>
                                  <html lang="en">
                                  <head>
                                    <meta charset="UTF-8" />
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                    <title>Welcome to OMIXELO</title>
                                  </head>
                                  <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 20px;">
                                      <tr>
                                        <td align="center">
                                          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
                                            <tr>
                                              <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;">
                                                <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Welcome</p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td style="padding:40px 40px 20px;">
                                                <p style="margin:0 0 8px;color:#1a1a2e;font-size:18px;font-weight:600;">Welcome to OMIXELO, ${userData.sid}!</p>
                                                <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                                                  We're thrilled to have you here. Your account has been successfully created. You can now log in and start exploring all the features we have to offer.
                                                </p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td style="padding:0 40px;">
                                                <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
                                              </td>
                                            </tr>
                                            <tr>
                                              <td style="padding:24px 40px 32px;text-align:center;">
                                                <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">This is an automated message from OMIXELO.</p>
                                                <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} OMIXELO. All rights reserved.</p>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </body>
                                  </html>
                                `
                            });
                            
                            if (emailResponse.error) {
                                console.error("Resend API Error:", emailResponse.error);
                            } else {
                                console.log("Welcome email sent successfully:", emailResponse.data);
                            }
                        } catch (err) {
                            console.error("Failed to send welcome email:", err);
                        }
                        
                        // IMPORTANT: Resolve the promise so execution can continue
                        resolve(result);
                    }
                });
            });
            
            // Clean up Redis
            await redis.del(`signup:${email}`);
            await redis.del(email);
            
            res.status(200).json({ message: "Account created successfully" });
        } else {
            res.status(401).json({ message: "Invalid OTP" });
        }
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ message: "Database or server error" });
    }
});




module.exports = router;