import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const isSupabase = connectionString?.includes('supabase') || connectionString?.includes('pooler');
    
    const pool = new Pool({
      connectionString,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    const adapter = new PrismaPg(pool);
    super({ adapter } as any);
  }
  
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Base de datos conectada correctamente');
    } catch (err) {
      this.logger.error('Error conectando a la base de datos:', err);
    }
  }
}
