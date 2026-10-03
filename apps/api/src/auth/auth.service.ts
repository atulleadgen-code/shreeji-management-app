import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

export interface SignInDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private readonly supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_ANON_KEY ?? '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  async signIn(dto: SignInDto) {
    const email = dto.email?.trim();
    const password = dto.password?.trim();

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async validateSession(userId?: string) {
    if (!userId) {
      return {
        authenticated: false,
        message: 'No user session provided.',
      };
    }

    return {
      authenticated: true,
      userId,
    };
  }
}
