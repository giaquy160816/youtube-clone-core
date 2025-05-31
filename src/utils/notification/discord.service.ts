import configuration from 'src/config/configuration';
import axios from 'axios';
import { RequestContext } from 'src/common/request-context.service';

type NotifyLevel = 'error' | 'warn' | 'info' | 'success';

interface DiscordNotifyOptions {
    level?: NotifyLevel;
    title?: string;
    fields?: Record<string, string | number>;
    rawMessage?: string;
}

const LEVEL_CONFIG: Record<NotifyLevel, { color: number; prefix: string }> = {
    error: { color: 0xff0000, prefix: '❌ Error' },
    warn: { color: 0xffcc00, prefix: '⚠️ Warning' },
    info: { color: 0x3498db, prefix: 'ℹ️ Info' },
    success: { color: 0x2ecc71, prefix: '✅ Success' },
};

export async function sendDiscordNotification(options: DiscordNotifyOptions): Promise<void> {
    const webhookUrl = configuration().notify.discordWebhook;
    if (!webhookUrl) {
        console.warn('[⚠️] DISCORD_WEBHOOK_URL is not set');
        return;
    }

    const level = options.level || 'info';
    const { color, prefix } = LEVEL_CONFIG[level];
    const now = new Date();

    const req = RequestContext.currentRequest();
    const ip =
        req?.headers['x-forwarded-for']?.toString().split(',')[0] || req?.ip || 'unknown';
    const method = req?.method || 'N/A';
    const pathname = req?.originalUrl || 'N/A';

    const embedPayload = {
        title: options.title || `${prefix} at ${now.toLocaleTimeString()}`,
        color,
        timestamp: now.toISOString(),
        fields: Object.entries({
            IP: ip,
            Method: method,
            Path: pathname,
            ...options.fields,
        }).map(([name, value]) => ({
            name,
            value: `\`${value}\``,
            inline: false,
        })),
        description:
            !options.fields && options.rawMessage
                ? `\`\`\`\n${options.rawMessage}\n\`\`\``
                : undefined,
        footer: {
            text: 'NestJS Notifier',
            icon_url: 'https://nestjs.com/img/logo-small.svg',
        },
    };

    try {
        await axios.post(webhookUrl, {
            username: '🔔 NestJS Bot',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/3281/3281298.png',
            embeds: [embedPayload],
        });
        console.log(`[✅] Discord notification sent (${level})`);
    } catch (error) {
        console.error('[❌] Failed to send Discord notification:', error);
    }
}