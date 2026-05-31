import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendKey: string | undefined;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    this.resendKey = config.get<string>('resendApiKey');
    this.fromAddress =
      config.get<string>('emailFrom') ?? 'Walker <noreply@walker.studio>';
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const subject = 'Reset your Walker password';
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Reset your password</h2>
        <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.5;">
          We received a request to reset the password for your Walker account.
          Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 28px;background:#7c3aed;color:#fff;
                  font-weight:600;font-size:15px;text-decoration:none;border-radius:8px;">
          Reset password
        </a>
        <p style="margin:24px 0 0;color:#999;font-size:13px;line-height:1.5;">
          If you did not request a password reset, you can safely ignore this email —
          your password will not change.<br><br>
          Or copy this link into your browser:<br>
          <a href="${resetUrl}" style="color:#7c3aed;word-break:break-all;">${resetUrl}</a>
        </p>
      </div>
    `;

    if (!this.resendKey) {
      // Dev / unconfigured: log the link so the developer can use it directly.
      this.logger.warn(
        `[EmailService] RESEND_API_KEY not set — password reset URL:\n${resetUrl}`,
      );
      return;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.resendKey}`,
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.error(`[EmailService] Resend API error ${res.status}: ${body}`);
      // Don't throw — the endpoint should still return 200 to avoid email enumeration
    } else {
      this.logger.log(`[EmailService] Reset email sent to ${to}`);
    }
  }
}
