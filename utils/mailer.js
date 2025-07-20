import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your OTP Code - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Hello,</p>
        <p>Use the following One-Time Password (OTP) to verify your email address. This code is valid for <strong>10 minutes</strong>.</p>
        
        <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; padding: 10px; background-color: #f4f4f4; border-radius: 6px; color: #2c3e50;">
          ${otp}
        </div>
        
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Thanks,<br/>The YourApp Team</p>
      </div>
    `,
  });
}



export async function sendResetEmail(email, url) {
    await transporter.sendMail({
      from: '"YourApp" <no-reply@yourapp.com>',
      to: email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${url}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    });
  }
  