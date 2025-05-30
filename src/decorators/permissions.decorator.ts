import { Reflector } from "@nestjs/core";
export const Permissions = Reflector.createDecorator<string[]>();

// check many roles
export const matchRoles = (userRoles: string[], requiredRoles: string[]): boolean => {
    return userRoles.some(role => requiredRoles.includes(role));        
}

// check 1 role
export const matchRole = (userRoles: string, requiredRoles: string[]): boolean => {
    return requiredRoles.includes(userRoles);
}