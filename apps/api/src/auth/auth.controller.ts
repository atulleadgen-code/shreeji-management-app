import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { SignInDto } from './auth.service.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Get('session')
  async validateSession(@Req() request: { headers: Record<string, string | string[] | undefined> }) {
    const userId = request.headers['x-user-id'];

    return this.authService.validateSession(
      Array.isArray(userId) ? userId[0] : typeof userId === 'string' ? userId : undefined,
    );
  }
}
