import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service.js';
import type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/index.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';

@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  async findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreatePurchaseOrderDto, @Req() request: { user?: { id?: string } }) {
    dto.created_by ??= request.user?.id ?? null;
    return this.purchaseOrdersService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @Req() request: { user?: { id?: string } },
  ) {
    dto.created_by ??= request.user?.id ?? null;
    return this.purchaseOrdersService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}
