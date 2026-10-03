import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import type { Request } from 'express';

type AuthenticatedUser = {
  id?: string;
  role?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  [key: string]: any;
};

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header.');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired Supabase session.');
    }

    request.user = {
      ...data.user,
      role: data.user.app_metadata?.role ?? data.user.user_metadata?.role ?? 'user',
    };
    return true;
  }
}
