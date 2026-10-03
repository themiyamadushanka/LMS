const express = require('express');
const {Redis} = require('@upstash/redis');
const {Resend }= require("resend");
require('dotenv').config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API);

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

router.post('', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    
    await redis.set(email, otpCode.toString(), { ex: 600 });
    resend.emails.send({
        from: "OMIXELO <verify@omixelo.com>",
        to: [email],
        subject: `${otpCode} is your OMIXELO verification code`,
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verification Code</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;">
                    <img src="http://localhost:${process.env.PORT || 8890}/logo.jpg" alt="OMIXELO" width="140" style="display:block;margin:0 auto 10px;max-width:140px;height:auto;" />
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Verification</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 40px 20px;">
                    <p style="margin:0 0 8px;color:#1a1a2e;font-size:18px;font-weight:600;">Verify your identity</p>
                    <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                      Please use the following verification code to complete your action. This code is valid for <strong style="color:#1a1a2e;">10 minutes</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 40px 32px;">
                    <div style="display:inline-block;background:#f0f1ff;border:2px dashed #818cf8;border-radius:10px;padding:20px 48px;">
                      <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#1a1a2e;font-family:'Courier New',monospace;">${otpCode}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef3cd;border-left:4px solid #f59e0b;border-radius:0 6px 6px 0;padding:0;">
                      <tr>
                        <td style="padding:14px 16px;">
                          <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                            ⚠️ If you did not request this code, please ignore this email. Do <strong>not</strong> share this code with anyone.
                          </p>
                        </td>
                      </tr>
                    </table>
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
    `,
    });
    
    res.status(200).json({ message: 'OTP sent successfully' });
});

/*const MiddlewareOTP = async(req,res,next)=>{
    const {email} = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    const storedOTP = await redis.get(email);
    if (storedOTP !== otpCode) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
    await redis.del(email);
    res.status(200).json({ message: 'OTP verified successfully' });
}*/

const verifyOTP = async(email,otp) => {

    const otpRedis = await redis.get(email);

    if (Number(otpRedis)===Number(otp)){
        return true
    }
    return false


}

module.exports = router;