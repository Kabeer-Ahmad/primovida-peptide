import nodemailer from 'nodemailer'

const FROM = process.env.EMAIL_FROM ?? 'PRIMOVIDAL <noreply@localhost>'

const CTA_LINK_STYLE =
  'display:inline-block;background:#C9A84C;color:#0A0A0A;font-weight:bold;padding:14px 28px;border-radius:16px;text-decoration:none;margin-top:20px;font-size:16px;'

/** Convert plain text with [label](url) links to styled HTML */
export function markdownToHtml(text: string): string {
  const paras = text
    .split(/\n\n+/)
    .map(
      (p) =>
        `<p style="margin:0 0 1em 0;font-size:16px;line-height:1.6;color:#0A0A0A;">${p.replace(/\n/g, '<br>')}</p>`
    )
    .join('')
  return paras.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a href="$2" style="${CTA_LINK_STYLE}">$1</a>`
  )
}

/** Wrap body HTML in a responsive email layout with PRIMOVIDAL styling */
export function wrapEmailHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRIMOVIDAL</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;color:#0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="font-size:16px;line-height:1.6;color:#0A0A0A;">
              ${bodyHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Full email HTML from plain body text (markdown links + wrapper) */
export function bodyToEmailHtml(text: string): string {
  return wrapEmailHtml(markdownToHtml(text))
}

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'true'
  if (!host || !port) return null
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: user && pass ? { user, pass } : undefined,
  })
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = getTransport()
  if (!transport) return false
  try {
    await transport.sendMail({
      from: FROM,
      to,
      subject,
      html,
    })
    return true
  } catch (e) {
    console.error('sendEmail error', e)
    return false
  }
}
