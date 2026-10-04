import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStats() {
    const [activeClientCount, purchaseOrderCount, revenue, recentOrders] = await Promise.all([
      prisma.client.count({ where: { status: 'active' } }),
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.aggregate({ _sum: { total_amount: true } }),
      prisma.purchaseOrder.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { location: { include: { client: true } } },
      }),
    ]);

    return {
      activeClientCount,
      purchaseOrderCount,
      totalRevenue: Number(revenue._sum.total_amount ?? 0),
      recentPurchaseOrders: recentOrders.map((order) => ({
        id: order.id,
        po_number: order.po_number,
        order_date: order.order_date.toISOString(),
        total_amount: order.total_amount?.toString() ?? null,
        status: order.status,
        client_name: order.location.client.name,
        location_name: order.location.name,
      })),
    };
  }
}