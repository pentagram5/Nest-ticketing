import { ConfigService } from '@nestjs/config';

export const redisConfig = async (configService: ConfigService) => {
  return {
    type: 'cluster',
    nodes: [
      {
        host: configService.get<string>('REDIS_HOST'),
        port: 6371,
      },
      {
        host: configService.get<string>('REDIS_HOST'),
        port: 6372,
      },
      {
        host: configService.get<string>('REDIS_HOST'),
        port: 6373,
      },
      {
        host: configService.get<string>('REDIS_HOST'),
        port: 6374,
      },
      {
        host: configService.get<string>('REDIS_HOST'),
        port: 6375,
      },
      {
        host: configService.get<string>('REDIS_HOST'),
        port: 6379,
      },
    ],
    options: {
      redisOptions: {
        password: 'bitnami',
      },
    },
  };
};
