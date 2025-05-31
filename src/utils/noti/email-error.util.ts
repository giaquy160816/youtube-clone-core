import * as nodemailer from 'nodemailer';

export async function sendErrorEmail(subject: string, message: string): Promise<void> {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Error Notifier" <${process.env.SMTP_USER}>`,
            to: process.env.ERROR_NOTIFY_EMAIL || 'admin@example.com',
            subject,
            text: message,
        });

        console.log('[📧] Error email sent!');
    } catch (err) {
        console.error('[❌] Failed to send error email:', err);
    }
}