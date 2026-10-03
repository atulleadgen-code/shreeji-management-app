import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<{ message: string; status: string }> {
    return {
      message: 'Shreeji Project Management API is running.',
      status: 'ok',
    };
  }
}
