import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',

      useFactory: async (): Promise<Redis> => {
        const client = new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,

          retryStrategy: (times) => Math.min(times * 100, 3000),
        });

        try {
          await client.ping();
          console.log('Redis connected successfully');
        } catch (error) {
          console.error('Redis connection failed:', error);
          throw error;
        }

        return client;
      },
    },
  ],

  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
