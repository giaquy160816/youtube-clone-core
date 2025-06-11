import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SettingService } from 'src/modules/backend/setting/setting.service';
// import { sendErrorEmail } from 'src/utils/notification/email.service'; // Nếu muôn gửi mail lỗi thì bật lên
import { sendSlackNotification } from 'src/utils/notification/slack.service';


@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
    constructor(private settingService: SettingService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const forwarded = req.headers['x-forwarded-for'];
        let ip: string = (typeof forwarded === 'string'
            ? forwarded.split(',')[0].trim()
            : req.socket.remoteAddress) ?? 'UNKNOWN_IP';

        if (ip.startsWith('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }

        try {
            const allowIpSetting = await this.settingService.findByKey('allow_ip');

            if (!allowIpSetting) {
                return next();
            }

            const whitelist = allowIpSetting.value
                .split(',')
                .map((ip) => ip.trim());

            if (!whitelist.includes(ip)) {
                // await sendErrorEmail('IP bị chặn', `IP ${ip} bị từ chối truy cập vào hệ thống tại ${new Date().toISOString()}`); // Nếu muôn gửi mail lỗi thì bật lên

                // send discord notification
                await sendSlackNotification({
                    level: 'error',
                    title: '🚨 Middleware IP Blocked',
                    fields: {
                        'Reason': 'Not in whitelist',
                        'Time': new Date().toISOString(),
                    },
                });
                // send discord notification

                return res.status(403).json({
                    statusCode: 403,
                    message: `You are not allowed to access this resource`,
                    // data: null,
                });
            }

            return next();

        } catch (err) {
            console.error('IP Middleware error:', err);
            return next();
        }
    }
}