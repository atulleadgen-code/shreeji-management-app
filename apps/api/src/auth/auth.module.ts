import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RolesGuard } from './roles.guard.js';
import { SupabaseAuthGuard } from './supabase-auth.guard.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, RolesGuard],
  exports: [SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
