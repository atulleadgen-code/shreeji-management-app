import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import type { CreateClientDto, UpdateClientDto } from './dto/index.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';

@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateClientDto, @Req() request: { user?: { id?: string } }) {
    dto.created_by ??= request.user?.id ?? null;
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @Req() request: { user?: { id?: string } },
  ) {
    dto.created_by ??= request.user?.id ?? null;
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
