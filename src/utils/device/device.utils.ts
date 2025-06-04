import { Request } from 'express';
import * as UAParser from 'ua-parser-js';

export interface DeviceInfo {
    device: string;
    agent: string;
    ip: string;
}

export const getDeviceInfo = (req: Request): DeviceInfo => {
    const ua = new UAParser.UAParser(req.headers['user-agent']);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    const deviceInfo = {
        device: device.type || 'desktop',
        agent: `${browser.name || 'Unknown'} ${browser.version || ''} on ${os.name || 'Unknown'} ${os.version || ''}`,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
    };

    return deviceInfo;
}; 