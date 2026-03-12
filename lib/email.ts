import nodemailer from 'nodemailer'

const FROM = process.env.EMAIL_FROM ?? 'PRIMOVIDAL <noreply@localhost>'

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
