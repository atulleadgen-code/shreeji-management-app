import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateWorkerDto, UpdateWorkerDto } from './dto/index.js';

function parseDailyWage(value: number | string | null | undefined) {
  if (value === undefined || value === null) return value;
  const wage = Number(value);
  if (!Number.isFinite(wage) || wage < 0) {
    throw new BadRequestException('Daily wage must be a non-negative number.');
  }
  return wage;
}

@Injectable()
export class WorkersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return prisma.worker.findMany({
      include: { location: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!worker) {
      throw new NotFoundException(`Worker with id ${id} not found.`);
    }

    return worker;
  }

  async create(dto: CreateWorkerDto) {
    return prisma.worker.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone ?? null,
        aadharNumber: dto.aadharNumber ?? null,
        skill: dto.skill,
        status: dto.status ?? 'ACTIVE',
        dailyWage: parseDailyWage(dto.dailyWage),
        documentUrl: dto.documentUrl ?? null,
        locationId: dto.locationId ?? null,
      },
      include: { location: true },
    });
  }

  async update(id: string, dto: UpdateWorkerDto) {
    await this.findOne(id);

    return prisma.worker.update({
      where: { id },
      data: {
        name: dto.name?.trim() ?? undefined,
        phone: dto.phone ?? undefined,
        aadharNumber: dto.aadharNumber ?? undefined,
        skill: dto.skill ?? undefined,
        status: dto.status ?? undefined,
        dailyWage: dto.dailyWage === undefined ? undefined : parseDailyWage(dto.dailyWage),
        documentUrl: dto.documentUrl ?? undefined,
        locationId: dto.locationId ?? undefined,
      },
      include: { location: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return prisma.worker.delete({ where: { id } });
  }
}