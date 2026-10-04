import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module.js';
import { WorkersModule } from './workers/workers.module.js';

@Module({
  imports: [PrismaModule, AuthModule, ClientsModule, LocationsModule, PurchaseOrdersModule, DashboardModule, WorkersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
