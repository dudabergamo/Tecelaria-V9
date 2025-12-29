import { Resend } from 'resend';
import { ENV } from './_core/env';

const resend = new Resend(ENV.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: 'Tecelaria <noreply@tecelaria.com.br>',
    to,
    subject,
    html,
  });
}
