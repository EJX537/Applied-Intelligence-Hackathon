import { createClient } from '@insforge/sdk';

const INSFORGE_URL = 'https://axp58q2i.us-east.insforge.app';
const INSFORGE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTkzNzF9.JWU7NFZiO2nvb2EMenwKS0hvEN-svd0P4HuhRPCQLxw';

const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

async function main() {
  const emailAddress = process.argv[2];
  if (!emailAddress) {
    console.error('Error: Please specify an email address.');
    console.log('Usage: node send_test_email.js your-email@domain.com');
    process.exit(1);
  }

  console.log(`Sending test invitation email to: ${emailAddress}...`);

  const inviteLink = `http://localhost:5173/#/auth?token=mock-token-id&email=${encodeURIComponent(emailAddress)}`;

  const emailContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 20px auto; padding: 24px; border: 1px solid #e5e4e7; border-radius: 16px; background-color: #ffffff;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
        <span style="font-size: 28px;">💚</span>
        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #08060d;">HealthTrack System</h2>
      </div>
      <h3 style="margin-top: 0; color: #08060d; font-size: 18px;">Account Setup Invitation (Test)</h3>
      <p style="color: #6b6375; line-height: 1.5; font-size: 14px;">Your healthcare provider has invited you to set up your HealthTrack client account. Setting up your account will allow you to sync steps, heart rate metrics, and manage your food log directly with your care team.</p>
      <div style="margin: 32px 0 24px; text-align: center;">
        <a href="${inviteLink}" style="background-color: #22c55e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(34,197,94,0.25);">Accept Invitation & Sign Up</a>
      </div>
      <p style="color: #6b6375; font-size: 11px; margin-top: 24px; border-top: 1px solid #e5e4e7; padding-top: 16px;">If you did not expect this invitation, please ignore this email. Link: <br/><a href="${inviteLink}" style="color: #22c55e; word-break: break-all;">${inviteLink}</a></p>
    </div>
  `;

  try {
    const { error } = await insforge.emails.send({
      to: emailAddress,
      subject: 'Test Invitation: Set up your HealthTrack client account',
      html: emailContent,
    });

    if (error) {
      throw error;
    }

    console.log('🎉 SUCCESS: Test invitation email has been sent!');
    console.log('Please check your inbox (and spam/junk folders) shortly.');
  } catch (err) {
    console.error('Failed to send test email:', err.message || err);
  }
}

main();
