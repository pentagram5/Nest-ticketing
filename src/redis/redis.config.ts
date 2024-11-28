import { ConfigService } from '@nestjs/config';
import { RedisSingleOptions } from '@nestjs-modules/ioredis';

export const redisConfig = (
  configService: ConfigService,
): RedisSingleOptions => {
  return {
    type: 'single',
    url: `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<string>('REDIS_PORT')}`,
    options: {
      password: configService.get<string>('REDIS_PASSWORD'),
    },
  };
};
