export const EMAIL_1 = {
  subject: (firstName: string) => `Your protocol is ready, ${firstName}`,
  body: (firstName: string, unlockUrl: string) =>
    `Hi ${firstName},

We've built your personalised peptide protocol. It's locked and waiting for you.

Unlock it when you're ready to see exactly what we've put together for your body, your goals, and your biology.

[Unlock My Protocol](${unlockUrl})`,
  ctaText: 'Unlock My Protocol',
}

export const EMAIL_2 = {
  subject: (firstName: string) => `Here's what's inside your plan, ${firstName}`,
  body: (firstName: string, unlockUrl: string) =>
    `Hi ${firstName},

Your protocol includes a specific compound, dosing schedule, cycle length, and a vendor recommendation we trust.

We've tailored it to your answers — your goal, your experience level, and your body. No generic advice.

Ready to see it in full?

[Get My Protocol](${unlockUrl})`,
  ctaText: 'Get My Protocol',
}

export const EMAIL_3 = {
  subject: (firstName: string) => `Your plan is still saved, ${firstName}`,
  body: (firstName: string, unlockUrl: string) =>
    `Hi ${firstName},

No pressure — we've kept your protocol ready for you.

Whenever you're ready to unlock it, it'll be there. Same personalised plan, same recommendation.

[View My Protocol](${unlockUrl})`,
  ctaText: 'View My Protocol',
}

export const EMAIL_4 = {
  subject: () => 'Action needed — payment failed',
  body: (firstName: string, billingPortalUrl: string) =>
    `Hi ${firstName},

Your PRIMOVIDAL subscription payment didn't go through. Update your card to keep access to your protocol.

[Update Payment Method](${billingPortalUrl})`,
  ctaText: 'Update Payment Method',
}
