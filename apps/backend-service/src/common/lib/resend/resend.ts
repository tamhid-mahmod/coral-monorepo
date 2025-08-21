import 'dotenv/config';

import * as ejs from 'ejs';
import * as path from 'path';
import { Resend } from 'resend';

// ----------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

// ----------------------------------------------------------------------

// Render an EJS email template
const renderEmailTemplate = (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    'src',
    'common',
    'templates',
    `${templateName}.ejs`,
  );

  return ejs.renderFile(templatePath, data);
};

// send an email using resend
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>,
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    await resend.emails.send({
      from: 'Coral <no-reply@protivamef.com>',
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Error sending email', error);
    return false;
  }
};
