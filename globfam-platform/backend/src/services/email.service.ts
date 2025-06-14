import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { redisClient } from '../config/redis';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static initialize() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        logger.error('Email service initialization failed:', error);
      } else {
        logger.info('Email service ready');
      }
    });
  }

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"GlobFam" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || this.htmlToText(options.html),
        html: options.html,
      });

      logger.info(`Email sent: ${info.messageId} to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Email send failed:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(userId: string, verificationToken: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const template = this.getTemplate('welcome', {
      name: user.firstName,
      verificationUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  static async sendPasswordResetEmail(userId: string, resetToken: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const template = this.getTemplate('passwordReset', {
      name: user.firstName,
      resetUrl,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  static async sendTransactionAlert(userId: string, transaction: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    const template = this.getTemplate('transactionAlert', {
      name: user.firstName,
      amount: `${transaction.currency}${transaction.amount}`,
      description: transaction.description,
      type: transaction.type,
      date: new Date(transaction.date).toLocaleDateString(),
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  static async sendBudgetAlert(userId: string, budget: any, percentage: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    const template = this.getTemplate('budgetAlert', {
      name: user.firstName,
      budgetName: budget.name,
      percentage: Math.round(percentage),
      remaining: budget.daysRemaining,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  static async sendGoalAchievedEmail(userId: string, goal: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    const template = this.getTemplate('goalAchieved', {
      name: user.firstName,
      goalName: goal.name,
      amount: `${goal.currency}${goal.targetAmount}`,
      completedDate: new Date().toLocaleDateString(),
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  static async sendFamilyInviteEmail(email: string, inviterName: string, familyName: string, inviteToken: string) {
    const inviteUrl = `${process.env.FRONTEND_URL}/family/join?token=${inviteToken}`;

    const template = this.getTemplate('familyInvite', {
      inviterName,
      familyName,
      inviteUrl,
    });

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });
  }

  static async sendWeeklySummary(userId: string, summary: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    const template = this.getTemplate('weeklySummary', {
      name: user.firstName,
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netSavings: summary.netSavings,
      topExpenseCategory: summary.topExpenseCategory,
      goalProgress: summary.goalProgress,
      weekStart: summary.weekStart,
      weekEnd: summary.weekEnd,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
  }

  private static getTemplate(templateName: string, data: Record<string, any>): EmailTemplate {
    const templates: Record<string, (data: any) => EmailTemplate> = {
      welcome: (data) => ({
        name: 'welcome',
        subject: 'Welcome to GlobFam - Verify Your Email',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563EB, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to GlobFam! 🌍</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.name},</h2>
                <p>Thank you for joining GlobFam! We're excited to help you manage your family's global finances.</p>
                <p>Please verify your email address to get started:</p>
                <center>
                  <a href="${data.verificationUrl}" class="button">Verify Email</a>
                </center>
                <p>Or copy this link: ${data.verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>The GlobFam Team</p>
              </div>
              <div class="footer">
                <p>© 2024 GlobFam. Global Families, Local Wisdom.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),

      passwordReset: (data) => ({
        name: 'passwordReset',
        subject: 'Reset Your GlobFam Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #DC2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.name},</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <center>
                  <a href="${data.resetUrl}" class="button">Reset Password</a>
                </center>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The GlobFam Team</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),

      transactionAlert: (data) => ({
        name: 'transactionAlert',
        subject: `Transaction Alert: ${data.amount} ${data.type}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Transaction Alert</h2>
              <p>Hi ${data.name},</p>
              <p>A new transaction has been recorded:</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Amount:</strong> ${data.amount}</p>
                <p><strong>Type:</strong> ${data.type}</p>
                <p><strong>Description:</strong> ${data.description}</p>
                <p><strong>Date:</strong> ${data.date}</p>
              </div>
              <p>Log in to GlobFam to view more details.</p>
            </div>
          </body>
          </html>
        `,
      }),

      budgetAlert: (data) => ({
        name: 'budgetAlert',
        subject: `Budget Alert: ${data.percentage}% Used`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Budget Alert ⚠️</h2>
              <p>Hi ${data.name},</p>
              <p>Your budget "${data.budgetName}" has reached ${data.percentage}% utilization.</p>
              <p>You have ${data.remaining} days remaining in this budget period.</p>
              <p>Consider reviewing your spending to stay within budget.</p>
              <a href="${process.env.FRONTEND_URL}/budgets" style="display: inline-block; padding: 10px 20px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px;">View Budget Details</a>
            </div>
          </body>
          </html>
        `,
      }),

      goalAchieved: (data) => ({
        name: 'goalAchieved',
        subject: `🎉 Goal Achieved: ${data.goalName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
              <h1 style="color: #059669;">Congratulations! 🎉</h1>
              <p>Hi ${data.name},</p>
              <p>You've achieved your financial goal!</p>
              <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 30px; border-radius: 10px; margin: 20px 0;">
                <h2 style="color: #059669; margin: 0;">${data.goalName}</h2>
                <p style="font-size: 24px; margin: 10px 0;"><strong>${data.amount}</strong></p>
                <p>Completed on ${data.completedDate}</p>
              </div>
              <p>Great job on reaching this milestone! Ready to set your next goal?</p>
              <a href="${process.env.FRONTEND_URL}/goals" style="display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 5px;">Set New Goal</a>
            </div>
          </body>
          </html>
        `,
      }),

      familyInvite: (data) => ({
        name: 'familyInvite',
        subject: `You're invited to join ${data.familyName} on GlobFam`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Family Invitation 👨‍👩‍👧‍👦</h2>
              <p>${data.inviterName} has invited you to join their family "${data.familyName}" on GlobFam.</p>
              <p>GlobFam helps families manage their finances together across borders and currencies.</p>
              <center>
                <a href="${data.inviteUrl}" style="display: inline-block; padding: 12px 30px; background: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Accept Invitation</a>
              </center>
              <p>This invitation will expire in 7 days.</p>
            </div>
          </body>
          </html>
        `,
      }),

      weeklySummary: (data) => ({
        name: 'weeklySummary',
        subject: 'Your GlobFam Weekly Summary',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Weekly Financial Summary 📊</h2>
              <p>Hi ${data.name},</p>
              <p>Here's your financial summary for ${data.weekStart} - ${data.weekEnd}:</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h3>Income & Expenses</h3>
                <p><strong>Total Income:</strong> ${data.totalIncome}</p>
                <p><strong>Total Expenses:</strong> ${data.totalExpenses}</p>
                <p><strong>Net Savings:</strong> ${data.netSavings}</p>
                <p><strong>Top Expense Category:</strong> ${data.topExpenseCategory}</p>
              </div>
              <div style="background: #e0f2fe; padding: 20px; border-radius: 5px; margin-top: 20px;">
                <h3>Goal Progress</h3>
                <p>${data.goalProgress}</p>
              </div>
              <p>Keep up the great work managing your family's finances!</p>
            </div>
          </body>
          </html>
        `,
      }),
    };

    const templateFn = templates[templateName];
    if (!templateFn) {
      throw new Error(`Template ${templateName} not found`);
    }

    return templateFn(data);
  }

  private static htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Rate limiting for emails
  static async canSendEmail(userId: string, type: string): Promise<boolean> {
    const key = `email:limit:${userId}:${type}`;
    const count = await redisClient.incr(key);
    
    if (count === 1) {
      await redisClient.expire(key, 3600); // 1 hour window
    }
    
    const limits: Record<string, number> = {
      welcome: 3,
      passwordReset: 3,
      transactionAlert: 20,
      budgetAlert: 10,
      default: 50,
    };
    
    const limit = limits[type] || limits.default;
    return count <= limit;
  }
}

// Initialize on startup
EmailService.initialize();