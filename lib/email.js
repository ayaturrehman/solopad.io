import { Resend } from "resend";
import db from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ─── Default email templates ────────────────────────────────────────────────
// These are used when the user hasn't customized a template.
// Variables: {{clientName}}, {{amount}}, {{invoiceNumber}}, {{projectTitle}},
//            {{dueDate}}, {{daysOverdue}}, {{payLink}}, {{senderName}}, {{portalLink}}

export const DEFAULT_TEMPLATES = {
  payment_received: {
    subject: "Payment received for {{projectTitle}}",
    body: `<p>Your client <strong>{{clientName}}</strong> paid <strong>{{amount}}</strong> for <strong>{{projectTitle}}</strong>.</p><p>Login to SoloPad to view the details.</p>`,
    variables: ["clientName", "amount", "projectTitle"],
    description: "Sent to you when a client pays an invoice",
  },
  invoice_reminder: {
    subject: "Payment reminder: Invoice {{invoiceNumber}} is {{daysOverdue}} day(s) overdue",
    body: `<p>Hi {{clientName}},</p><p>This is a friendly reminder that invoice <strong>{{invoiceNumber}}</strong> for <strong>{{amount}}</strong> was due on <strong>{{dueDate}}</strong>.</p><p><a href="{{payLink}}" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Pay Now</a></p><p style="color:#71717a;font-size:12px;">Sent by {{senderName}} via SoloPad</p>`,
    variables: ["clientName", "invoiceNumber", "amount", "dueDate", "daysOverdue", "payLink", "senderName"],
    description: "Sent to clients when an invoice is overdue",
  },
  invoice_sent: {
    subject: "Invoice {{invoiceNumber}} from {{senderName}}",
    body: `<p>Hi {{clientName}},</p><p>{{senderName}} has sent you invoice <strong>{{invoiceNumber}}</strong>.</p><p><a href="{{portalLink}}" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View &amp; Pay Invoice</a></p><p style="color:#71717a;font-size:12px;">Powered by SoloPad</p>`,
    variables: ["clientName", "invoiceNumber", "senderName", "portalLink"],
    description: "Sent to clients when you send an invoice",
  },
  proposal_sent: {
    subject: "Proposal from {{senderName}}",
    body: `<p>Hi {{clientName}},</p><p>Please find the attached proposal for your review.</p><p style="color:#71717a;font-size:12px;">Sent from SoloPad</p>`,
    variables: ["clientName", "senderName"],
    description: "Sent to clients when you send a proposal",
  },
  contract_sent: {
    subject: "Contract for review — {{projectTitle}}",
    body: `<p>Hi {{clientName}},</p><p>Please find the contract below for your review and signature.</p><p style="margin:28px 0"><a href="{{signingLink}}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Review &amp; Sign Contract</a></p><p style="color:#71717a;font-size:12px;">Sent from SoloPad</p>`,
    variables: ["clientName", "projectTitle", "signingLink"],
    description: "Sent to clients when you send a contract",
  },
  refund_processed: {
    subject: "Refund processed for {{projectTitle}}",
    body: `<p>A refund of <strong>{{amount}}</strong> has been processed for <strong>{{projectTitle}}</strong>.</p>`,
    variables: ["amount", "projectTitle"],
    description: "Sent to you when a refund is processed",
  },
  dispute_alert: {
    subject: "Payment dispute filed — {{projectTitle}}",
    body: `<p>A client has disputed the payment of <strong>{{amount}}</strong> for <strong>{{projectTitle}}</strong>.</p><p>You need to respond to this dispute in your <a href="https://dashboard.stripe.com/disputes">Stripe Dashboard</a> within the response window.</p>`,
    variables: ["amount", "projectTitle"],
    description: "Sent to you when a payment dispute is filed",
  },
};

// ─── Replace template variables ─────────────────────────────────────────────

function replaceVariables(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match);
}

// ─── Wrap email body in a styled container ──────────────────────────────────

function wrapHtml(body) {
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#18181b;max-width:600px">${body}</div>`;
}

// ─── Get template (custom or default) ───────────────────────────────────────

export async function getTemplate(businessId, type) {
  const custom = await db.emailTemplate.findUnique({
    where: { businessId_type: { businessId, type } },
  });

  if (custom) {
    return { subject: custom.subject, body: custom.body, isCustom: true };
  }

  const def = DEFAULT_TEMPLATES[type];
  if (!def) return null;

  return { subject: def.subject, body: def.body, isCustom: false };
}

// ─── Check if a notification type is enabled ────────────────────────────────

const TYPE_TO_SETTING = {
  payment_received: "notifyPaymentReceived",
  invoice_reminder: null, // controlled by overdueRemindersEnabled separately
  invoice_sent: null, // always allowed (user manually triggers)
  proposal_sent: null, // always allowed
  contract_sent: null, // always allowed
  refund_processed: "notifyPaymentReceived", // grouped with payment notifications
  dispute_alert: "notifyPaymentReceived", // always send disputes (critical)
};

export async function isNotificationEnabled(businessId, type) {
  // User-triggered sends (invoice, proposal, contract) are always allowed
  const settingKey = TYPE_TO_SETTING[type];
  if (settingKey === null || settingKey === undefined) return true;

  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { emailNotifications: true, [settingKey]: true },
  });

  if (!business) return true; // no business = no restrictions
  if (!business.emailNotifications) return false; // master toggle off
  return business[settingKey] !== false;
}

// ─── Send email with template ───────────────────────────────────────────────

export async function sendNotificationEmail({
  businessId,
  type,
  to,
  variables = {},
  overrideSubject,
  overrideBody,
  replyTo,
  attachments,
}) {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return { skipped: true, reason: "no_api_key" };
  }

  // Check notification preferences (skip for user-triggered sends)
  if (businessId) {
    const enabled = await isNotificationEnabled(businessId, type);
    if (!enabled) {
      return { skipped: true, reason: "disabled" };
    }
  }

  // Load template
  const template = businessId ? await getTemplate(businessId, type) : null;
  const defaults = DEFAULT_TEMPLATES[type];

  const subject = replaceVariables(
    overrideSubject || template?.subject || defaults?.subject || "Notification from SoloPad",
    variables
  );

  const body = replaceVariables(
    overrideBody || template?.body || defaults?.body || "<p>You have a new notification.</p>",
    variables
  );

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "noreply@solopad.app";

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      replyTo,
      html: wrapHtml(body),
      ...(attachments ? { attachments } : {}),
    });

    return { sent: true, id: result?.data?.id };
  } catch (err) {
    console.error(`[Email] Failed to send ${type} to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
}

// ─── Send test email ────────────────────────────────────────────────────────

export async function sendTestEmail(to, businessId) {
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "noreply@solopad.app";

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Test email from SoloPad",
      html: wrapHtml(`
        <p>Hi there!</p>
        <p>This is a test email from your SoloPad notification settings. If you're reading this, your email notifications are working correctly.</p>
        <p style="margin:20px 0;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;color:#166534;font-weight:600;">
          Email notifications are working
        </p>
        <p style="color:#71717a;font-size:12px;">Sent from SoloPad</p>
      `),
    });

    return { sent: true };
  } catch (err) {
    return { sent: false, error: err.message };
  }
}
