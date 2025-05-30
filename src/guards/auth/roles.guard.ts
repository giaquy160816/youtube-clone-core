import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { matchRoles, Permissions } from 'src/decorators/permissions.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(Permissions, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions) return true;

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.roles)
            throw new HttpException('You are not authorized to access this resource', HttpStatus.BAD_REQUEST);

        const userRoles = user.roles.split('|');
        const isMatch = matchRoles(userRoles, requiredPermissions);

        if (!isMatch) {
            throw new HttpException('Not enough permission', HttpStatus.BAD_REQUEST);
        }
        return isMatch;
    }
}