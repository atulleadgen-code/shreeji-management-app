import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/index.js';

function parseOrderDate(value: Date | string) {
  const orderDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(orderDate.getTime())) {
    throw new BadRequestException('Order date must be a valid date.');
  }

  return orderDate;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return prisma.purchaseOrder.findMany({
      include: { location: { include: { client: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with id ${id} not found.`);
    }

    return purchaseOrder;
  }

  async create(dto: CreatePurchaseOrderDto) {
    return prisma.purchaseOrder.create({
      data: {
        location_id: dto.location_id,
        po_number: dto.po_number,
        order_date: dto.order_date ? parseOrderDate(dto.order_date) : new Date(),
        total_amount: dto.total_amount ?? null,
        status: dto.status ?? 'draft',
        notes: dto.notes ?? null,
        created_by: dto.created_by ?? null,
      },
    });
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    await this.findOne(id);

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        location_id: dto.location_id ?? undefined,
        po_number: dto.po_number ?? undefined,
        order_date: dto.order_date ? parseOrderDate(dto.order_date) : undefined,
        total_amount: dto.total_amount ?? undefined,
        status: dto.status ?? undefined,
        notes: dto.notes ?? undefined,
        created_by: dto.created_by ?? undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return prisma.purchaseOrder.delete({
      where: { id },
    });
  }
}
