import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service.js';
import type { CreateLocationDto, UpdateLocationDto } from './dto/index.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';

@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll() {
    return this.locationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateLocationDto, @Req() request: { user?: { id?: string } }) {
    dto.created_by ??= request.user?.id ?? null;
    return this.locationsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @Req() request: { user?: { id?: string } },
  ) {
    dto.created_by ??= request.user?.id ?? null;
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
