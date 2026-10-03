import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClientDto, UpdateClientDto } from './dto/index.js';

@Injectable()
export class ClientsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return prisma.client.findMany({
      include: { locations: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { locations: true },
    });

    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found.`);
    }

    return client;
  }

  async create(dto: CreateClientDto) {
    return prisma.client.create({
      data: {
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        status: dto.status ?? 'active',
        created_by: dto.created_by ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);

    return prisma.client.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
        status: dto.status ?? undefined,
        created_by: dto.created_by ?? undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return prisma.client.delete({
      where: { id },
    });
  }
}
