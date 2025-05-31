import { Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<Request>();

@Injectable({ scope: Scope.DEFAULT })
export class RequestContext {
    static run(req: Request, callback: () => void) {
        asyncLocalStorage.run(req, callback);
    }

    static currentRequest(): Request | undefined {
        return asyncLocalStorage.getStore();
    }
}