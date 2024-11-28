import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private readonly ticketQueueKey = 'ticket_queue';
  private readonly purchaseQueueKey = 'ticket_purchase_queue';
  private maxPurchaseQueueLength: number;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  // 사용자 처리 함수
  async processUser(user: string) {
    // 대기열에서 한 명 가져오기

    // 구매진입열로 옮기기
    await this.redis.zrem(`waiting:concert:${this.ticketQueueKey}`, user);
    await this.redis.lpush(this.purchaseQueueKey, user);
    this.logger.log(`사용자 ${user}을(를) 구매진입열로 이동했습니다.`);
  }

  addCronJob() {
    this.maxPurchaseQueueLength = parseInt(
      this.configService.get<string>('MAX_PURCHASE_LENGTH'),
    );

    const job = new CronJob(`* * * * * *`, async () => {
      try {
        // 구매진입열 길이 확인
        const purchaseQueueLength = await this.redis.llen(
          this.purchaseQueueKey,
        );

        if (purchaseQueueLength < this.maxPurchaseQueueLength) {
          const slotsAvailable =
            this.maxPurchaseQueueLength - purchaseQueueLength;

          const promises = [];

          const queue = await this.redis.zrange(
            `waiting:concert:${this.ticketQueueKey}`,
            0,
            -1,
            'WITHSCORES',
          );
          if (!queue.length) {
            this.logger.log('티켓 대기열이 비어있습니다.');
            return; // 대기열에 사용자가 없으면 처리 중지
          }
          for (let i = 0; i < slotsAvailable; i++) {
            promises.push(this.processUser(queue[2 * i]));
          }

          // Promise.all로 모든 비동기 작업을 병렬로 처리
          await Promise.all(promises);
        } else {
          this.logger.log(
            '구매진입열이 이미 가득 찼습니다. 대기열에서 사용자를 옮기지 않습니다.',
          );
          // 대기열은 그대로 유지
        }
      } catch (error) {
        this.logger.error('큐 관리 중 오류 발생', error);
      }
    });

    const job2 = new CronJob(`*/3 * * * * *`, async () => {
      const user = await this.redis.rpop(this.purchaseQueueKey);
      if (user) this.logger.log(`사용자 ${user}가 구매행위를 마쳤습니다.`);
    });

    if (!this.isJobRunning('대기열To구매열')) {
      // @ts-ignore
      this.schedulerRegistry.addCronJob('대기열To구매열', job);
      job.start();
    }

    // "구매열완료"가 이미 실행 중이 아닌 경우에만 시작
    if (!this.isJobRunning('구매열완료')) {
      // @ts-ignore
      this.schedulerRegistry.addCronJob('구매열완료', job2);
      job2.start();
    }
  }

  private isJobRunning(jobName: string): boolean {
    try {
      // 이미 등록된 CronJob을 가져옵니다.
      const cronJob = this.schedulerRegistry.getCronJob(jobName);
      return cronJob.running; // 실행 중인지 확인
    } catch {
      return false; // CronJob이 등록되지 않았다면 false 반환
    }
  }
}
