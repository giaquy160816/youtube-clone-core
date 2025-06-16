import axios from 'axios';
import configuration from 'src/config/configuration';
import { RequestContext } from 'src/common/request-context.service';

type NotifyLevel = 'error' | 'warn' | 'info' | 'success';

interface SlackNotifyOptions {
    level?: NotifyLevel;
    title?: string;
    fields?: Record<string, string | number>;
    rawMessage?: string;
}

const LEVEL_CONFIG: Record<NotifyLevel, { color: string; prefix: string; emoji: string }> = {
    error:   { color: '#e74c3c', prefix: 'Error',   emoji: '❌' },
    warn:    { color: '#f39c12', prefix: 'Warning', emoji: '⚠️' },
    info:    { color: '#3498db', prefix: 'Info',    emoji: 'ℹ️' },
    success: { color: '#2ecc71', prefix: 'Success', emoji: '✅' },
};

export async function sendSlackNotification(options: SlackNotifyOptions): Promise<void> {
    const webhookUrl = configuration().notify.slackWebhook;
    if (!webhookUrl) {
        console.warn('[⚠️] SLACK_WEBHOOK_URL is not set');
        return;
    }

    const level = options.level || 'info';
    const { color, prefix, emoji } = LEVEL_CONFIG[level];
    const now = new Date();

    const req = RequestContext.currentRequest();
    const ip = req?.headers['x-forwarded-for']?.toString().split(',')[0] || req?.ip || 'unknown';
    const method = req?.method || 'N/A';
    const pathname = req?.originalUrl || 'N/A';

    const fields: Record<string, string | number> = {
        IP: ip,
        Method: method,
        Path: pathname,
        ...(options.fields || {}),
    };

    const slackFields = Object.entries(fields).map(([title, value]) => ({
        type: 'mrkdwn',
        text: `*${title}:*\n\`${value}\``
    }));

    const blocks = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `${emoji} ${options.title || `${prefix} at ${now.toLocaleTimeString()}`}`,
                emoji: true
            }
        },
        {
            type: 'section',
            fields: slackFields
        },
        ...(options.rawMessage
            ? [{
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `\`\`\`\n${options.rawMessage}\n\`\`\``
                }
            }]
            : []),
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `Sent at *${now.toISOString()}* by NestJS Notifier`
                }
            ]
        }
    ];

    try {
        console.log('blocks', blocks);
        await axios.post(webhookUrl, {
            username: '🔔 NestJS SlackBot',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/5968/5968705.png',
            blocks,
        });
        console.log(`[✅] Slack notification sent (${level})`);
    } catch (error) {
        console.error('[❌] Failed to send Slack notification:', error?.message || error);
    }
}