const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: config.email.service,
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass
  },
  tls: {
    rejectUnauthorized: false // Only for development, remove in production
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

/**
 * Send verification email
 * @param {string} toEmail - Recipient email
 * @param {string} token - Verification token
 * @param {string} username - Recipient name
 */
const sendVerificationEmail = async (toEmail, token, username) => {
  try {
    const verificationUrl = `${config.baseUrl}/auth/verify-email/${token}`;
    
    const mailOptions = {
      from: `"Volunteer Connect" <${config.email.from}>`,
      to: toEmail,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Welcome to Volunteer Connect!</h2>
          <p>Hello ${username},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; 
                      color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p style="margin-top: 30px; color: #777; font-size: 12px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${toEmail}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendVerificationEmail
};