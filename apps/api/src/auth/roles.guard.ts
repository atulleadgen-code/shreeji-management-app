import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY, type Role } from './roles.decorator.js';

type AuthenticatedUser = {
  id?: string;
  role?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  [key: string]: any;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated.');
    }

    const normalizedRole = (
      user.role ??
      user.app_metadata?.role ??
      user.app_metadata?.roles?.[0] ??
      user.user_metadata?.role ??
      user.user_metadata?.roles?.[0] ??
      'user'
    ).toLowerCase();

    if (!requiredRoles.some((role) => role.toLowerCase() === normalizedRole)) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    return true;
  }
}
