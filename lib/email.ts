import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Remove spaces from app password if any
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '') || '';
  
  console.log('📧 [EMAIL] Creating transporter with:');
  console.log('📧 [EMAIL] User:', process.env.GMAIL_USER);
  console.log('📧 [EMAIL] App Password (first 4 chars):', appPassword.substring(0, 4) + '****');
  console.log('📧 [EMAIL] App Password length:', appPassword.length);

  if (appPassword.length !== 16) {
    console.warn('⚠️ [EMAIL] App Password should be 16 characters. Current length:', appPassword.length);
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: appPassword, // Use App Password, not regular password
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 [EMAIL] Starting email send process...');
    console.log('📧 [EMAIL] To:', options.to);
    console.log('📧 [EMAIL] Subject:', options.subject);

    // Check credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ [EMAIL] Gmail credentials not configured');
      console.error('❌ [EMAIL] GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Missing');
      console.error('❌ [EMAIL] GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing');
      return false;
    }

    console.log('✅ [EMAIL] Gmail credentials found');
    console.log('📧 [EMAIL] From:', process.env.GMAIL_USER);
    console.log('📧 [EMAIL] App Password length:', process.env.GMAIL_APP_PASSWORD.length);

    // Create transporter
    console.log('📧 [EMAIL] Creating email transporter...');
    const transporter = createTransporter();
    console.log('✅ [EMAIL] Transporter created successfully');

    // Verify connection
    console.log('📧 [EMAIL] Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ [EMAIL] SMTP connection verified');

    const mailOptions = {
      from: `"FarmVeda" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      html: options.html,
    };

    console.log('📧 [EMAIL] Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL] Email sent successfully!');
    console.log('✅ [EMAIL] Message ID:', info.messageId);
    console.log('✅ [EMAIL] Response:', info.response);
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] Error sending email:');
    console.error('❌ [EMAIL] Error message:', error.message);
    console.error('❌ [EMAIL] Error code:', error.code);
    console.error('❌ [EMAIL] Full error:', JSON.stringify(error, null, 2));
    
    // Common error messages
    if (error.code === 'EAUTH') {
      console.error('❌ [EMAIL] Authentication failed!');
      console.error('❌ [EMAIL] Check your GMAIL_USER and GMAIL_APP_PASSWORD');
      console.error('❌ [EMAIL] Make sure App Password has no spaces (16 characters)');
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ [EMAIL] Connection failed!');
      console.error('❌ [EMAIL] Check your internet connection');
    }
    
    return false;
  }
}

export function generatePaymentLinkEmail(orderNumber: string, customerName: string, totalAmount: number, paymentLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3a8735; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #3a8735; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .order-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Request - FarmVeda</h1>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Your order <strong>#${orderNumber}</strong> has been delivered successfully!</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
          </div>
          
          <p>Please complete your payment using the link below:</p>
          <div style="text-align: center;">
            <a href="${paymentLink}" class="button">Pay Now</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #3a8735;">${paymentLink}</p>
          
          <p>Thank you for choosing FarmVeda!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateInvoiceEmail(orderNumber: string, customerName: string, totalAmount: number, invoiceUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3a8735; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #3a8735; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .order-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Confirmed - FarmVeda</h1>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Thank you! Your payment for order <strong>#${orderNumber}</strong> has been received successfully.</p>
          
          <div class="order-details">
            <h3>Payment Details:</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Amount Paid:</strong> ₹${totalAmount.toFixed(2)}</p>
            <p><strong>Payment Status:</strong> <span style="color: #3a8735; font-weight: bold;">Paid</span></p>
          </div>
          
          <p>Your invoice is ready. Please download it using the link below:</p>
          <div style="text-align: center;">
            <a href="${invoiceUrl}" class="button">Download Invoice</a>
          </div>
          
          <p>Thank you for your business!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

