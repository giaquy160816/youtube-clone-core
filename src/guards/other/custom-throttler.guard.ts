import {
    Injectable,
    ExecutionContext,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import {
    ThrottlerGuard,
    ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { Request } from 'express';
import { sendDiscordNotification } from 'src/utils/notification/discord.service';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('[CustomThrottlerGuard] canActivate triggered');
        return super.canActivate(context);
    }
    protected async throwThrottlingException(
        context: ExecutionContext,
        _limitDetail: ThrottlerLimitDetail, // bạn có thể dùng để hiện TTL còn lại nếu muốn
    ): Promise<void> {
        // send discord notification
        await sendDiscordNotification({
            level: 'error',
            title: '🚫 Rate limit exceeded'
        });
        // send discord notification
        throw new HttpException({
                statusCode: 429,
                message: '🚫 Bạn đã gọi API quá nhiều lần. Vui lòng thử lại sau 1 phút.',
            }, HttpStatus.TOO_MANY_REQUESTS);

    }
}