import transporter from '../config/mailer.js';

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "kada2group1@gmail.com",
      to,
      subject,
      text,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Specific email templates
export const sendPasswordResetEmail = async (to, resetToken, username) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const subject = 'Password Reset Request - Bulletin Board';
  
  const text = `
Hello ${username},

You requested a password reset for your Bulletin Board account.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email.

Best regards,
Bulletin Board Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello <strong>${username}</strong>,</p>
      
      <p>You requested a password reset for your Bulletin Board account.</p>
      
      <p>Please click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
      
      <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
      
      <p>If you didn't request this reset, please ignore this email.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">
        Best regards,<br>
        Bulletin Board Team
      </p>
    </div>
  `;

  return await sendEmail(to, subject, text, html);
};

export const sendPasswordChangeConfirmation = async (to, username) => {
  const subject = 'Password Changed Successfully - Bulletin Board';
  
  const text = `
Hello ${username},

Your password has been successfully changed.

If you didn't make this change, please contact our support team immediately.

Best regards,
Bulletin Board Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Password Changed Successfully</h2>
      <p>Hello <strong>${username}</strong>,</p>
      
      <p>Your password has been successfully changed.</p>
      
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; 
                  color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>✓ Security Update:</strong> Your account password was updated on ${new Date().toLocaleString()}.
      </div>
      
      <p>If you didn't make this change, please contact our support team immediately.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">
        Best regards,<br>
        Bulletin Board Team
      </p>
    </div>
  `;

  return await sendEmail(to, subject, text, html);
};
