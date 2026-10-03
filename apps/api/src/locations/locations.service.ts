import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLocationDto, UpdateLocationDto } from './dto/index.js';

@Injectable()
export class LocationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return prisma.location.findMany({
      include: { client: true, purchase_orders: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: { client: true, purchase_orders: true },
    });

    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found.`);
    }

    return location;
  }

  async create(dto: CreateLocationDto) {
    return prisma.location.create({
      data: {
        client_id: dto.client_id,
        name: dto.name,
        address: dto.address ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        postal_code: dto.postal_code ?? null,
        country: dto.country ?? null,
        status: dto.status ?? 'active',
        created_by: dto.created_by ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateLocationDto) {
    await this.findOne(id);

    return prisma.location.update({
      where: { id },
      data: {
        client_id: dto.client_id ?? undefined,
        name: dto.name ?? undefined,
        address: dto.address ?? undefined,
        city: dto.city ?? undefined,
        state: dto.state ?? undefined,
        postal_code: dto.postal_code ?? undefined,
        country: dto.country ?? undefined,
        status: dto.status ?? undefined,
        created_by: dto.created_by ?? undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return prisma.location.delete({
      where: { id },
    });
  }
}
