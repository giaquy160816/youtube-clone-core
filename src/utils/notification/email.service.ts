import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);
    private readonly notifyEmail: string;
    private readonly smtpUser: string;

    constructor(private configService: ConfigService) {
        const smtp = this.configService.get('app.smtp');
        const notify = this.configService.get('app.notify');

        this.smtpUser = smtp.user;
        this.notifyEmail = notify.errorEmail;

        if (!smtp.host || !smtp.user || !smtp.pass || !notify.errorEmail) {
            this.logger.warn('Missing SMTP config or notify email – error emails will not be sent.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.port === 465,
            auth: {
                user: smtp.user,
                pass: smtp.pass,
            },
        });
    }

    async sendErrorEmail(subject: string, message: string): Promise<void> {
        if (!this.transporter) {
            this.logger.error('SMTP transporter not initialized');
            return;
        }

        try {
            await this.transporter.sendMail({
                from: `"NestJS Notifier" <${this.smtpUser}>`,
                to: this.notifyEmail,
                subject,
                text: message,
            });

            this.logger.log(`📧 Error email sent to ${this.notifyEmail}`);
        } catch (err) {
            this.logger.error('❌ Failed to send error email', err.stack);
        }
    }
}