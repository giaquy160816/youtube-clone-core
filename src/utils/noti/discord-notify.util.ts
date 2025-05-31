import axios from 'axios';

export async function sendDiscordNotification(content: string): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('[⚠️] DISCORD_WEBHOOK_URL is not set');
        return;
    }

    try {
        await axios.post(webhookUrl, {
            content, // Nội dung thông báo
        });
        console.log('[✅] Sent Discord notification');
    } catch (error) {
        console.error('[❌] Failed to send Discord notification:', error);
    }
}