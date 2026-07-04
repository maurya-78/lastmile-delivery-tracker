const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    },
  });
};

const STATUS_MESSAGES = {
  'Order Placed': {
    subject: 'Your Order Has Been Placed',
    body: (order) =>
      `Your order <strong>#${order.orderNumber}</strong> has been successfully placed. We'll confirm it shortly.`,
  },
  Confirmed: {
    subject: 'Order Confirmed',
    body: (order) =>
      `Good news! Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being processed.`,
  },
  'Agent Assigned': {
    subject: 'Delivery Agent Assigned',
    body: (order, agentName) =>
      `A delivery agent <strong>${agentName || 'has been assigned'}</strong> to your order <strong>#${order.orderNumber}</strong> and will pick it up soon.`,
  },
  'Picked Up': {
    subject: 'Package Picked Up',
    body: (order) =>
      `Your package for order <strong>#${order.orderNumber}</strong> has been picked up and is on its way.`,
  },
  'In Transit': {
    subject: 'Package In Transit',
    body: (order) =>
      `Your order <strong>#${order.orderNumber}</strong> is now in transit and heading to the destination.`,
  },
  'Out for Delivery': {
    subject: 'Out for Delivery Today!',
    body: (order) =>
      `Your package for order <strong>#${order.orderNumber}</strong> is out for delivery. Expect it today!`,
  },
  Delivered: {
    subject: 'Package Delivered Successfully',
    body: (order) =>
      `Your order <strong>#${order.orderNumber}</strong> has been delivered. Thank you for using LastMile!`,
  },
  Failed: {
    subject: 'Delivery Attempt Failed',
    body: (order) =>
      `We were unable to deliver your order <strong>#${order.orderNumber}</strong>. Reason: ${order.failureReason || 'Customer unavailable'}. You can reschedule your delivery from your dashboard.`,
  },
  Rescheduled: {
    subject: 'Delivery Rescheduled',
    body: (order) =>
      `Your order <strong>#${order.orderNumber}</strong> has been rescheduled for <strong>${
        order.rescheduledDate ? new Date(order.rescheduledDate).toLocaleDateString() : 'a new date'
      }</strong>. A new agent will be assigned.`,
  },
  Cancelled: {
    subject: 'Order Cancelled',
    body: (order) =>
      `Your order <strong>#${order.orderNumber}</strong> has been cancelled. If this was a mistake, please contact support.`,
  },
};

const sendStatusEmail = async (toEmail, customerName, order, status, agentName = null) => {
  try {
    const template = STATUS_MESSAGES[status];
    if (!template) return;

    const transporter = createTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
          .header { background: #1a1a2e; padding: 28px 32px; text-align: center; }
          .header h1 { color: #e8c547; margin: 0; font-size: 22px; letter-spacing: 1px; }
          .header span { color: #aaa; font-size: 13px; }
          .body { padding: 32px; color: #333; }
          .body p { font-size: 15px; line-height: 1.6; }
          .status-badge { display: inline-block; background: #e8c547; color: #1a1a2e; font-weight: 700; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin: 12px 0; }
          .order-box { background: #f8f8f8; border-left: 4px solid #e8c547; padding: 14px 18px; border-radius: 4px; margin: 20px 0; }
          .order-box p { margin: 4px 0; font-size: 14px; color: #555; }
          .footer { text-align: center; padding: 20px; background: #f0f0f0; color: #999; font-size: 12px; }
          a.btn { display: inline-block; margin-top: 20px; background: #1a1a2e; color: #e8c547; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LastMile</h1>
            <span>Delivery Management Platform</span>
          </div>
          <div class="body">
            <p>Hi <strong>${customerName}</strong>,</p>
            <div class="status-badge">${status}</div>
            <p>${template.body(order, agentName)}</p>
            <div class="order-box">
              <p><strong>Order #:</strong> ${order.orderNumber}</p>
              <p><strong>Type:</strong> ${order.orderType} | ${order.paymentType}</p>
              <p><strong>From:</strong> ${order.pickup?.city}, ${order.pickup?.pincode}</p>
              <p><strong>To:</strong> ${order.drop?.city}, ${order.drop?.pincode}</p>
            </div>
            <a class="btn" href="${process.env.CLIENT_URL}/track/${order.orderNumber}">Track Your Order</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LastMile. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: toEmail,
      subject: `[LastMile] ${template.subject} - #${order.orderNumber}`,
      html,
    });

    console.log(`Email sent to ${toEmail} for status: ${status}`);
  } catch (err) {
    console.error(`Email send failed for ${toEmail}:`, err.message);
    // Non-blocking — don't throw, just log
  }
};

module.exports = { sendStatusEmail };