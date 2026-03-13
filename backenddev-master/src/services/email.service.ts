// Email Service Configuration
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const createEmailTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createEmailTransport();
    
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  welcomeEmail: (firstName: string, loginUrl: string) => ({
    subject: 'Welcome to Chat Application',
    html: `
      <h2>Welcome, ${firstName}!</h2>
      <p>Your account has been successfully created.</p>
      <p><a href="${loginUrl}">Click here to login</a></p>
      <p>Best regards,<br>Chat Application Team</p>
    `
  }),

  resetPasswordEmail: (resetLink: string) => ({
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }),

  notificationEmail: (userName: string, message: string) => ({
    subject: 'New Notification',
    html: `
      <h2>New Notification for ${userName}</h2>
      <p>${message}</p>
      <p>Log in to your account to view more details.</p>
    `
  }),

  applicationStatusEmail: (applicationId: string, status: string) => ({
    subject: `Application Status Update - ${status.toUpperCase()}`,
    html: `
      <h2>Your Application Status Has Changed</h2>
      <p>Your application (ID: ${applicationId}) status is now: <strong>${status}</strong></p>
      <p>Please log in to your account to view the details.</p>
    `
  })
};
