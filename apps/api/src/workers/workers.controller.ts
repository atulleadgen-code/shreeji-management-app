import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import type { CreateWorkerDto, UpdateWorkerDto } from './dto/index.js';
import { WorkersService } from './workers.service.js';

@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  findAll() {
    return this.workersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWorkerDto) {
    return this.workersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.workersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workersService.remove(id);
  }
}