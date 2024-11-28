import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { TaskService } from '../cron/cron.service';

@Controller('ticket')
export class TicketController {
  private user: number;
  private readonly ticketQueueKey = 'ticket_queue';
  private readonly purchaseQueueKey = 'ticket_purchase_queue';
  private readonly maxPurchaseQueueLength = 20;

  constructor(
    private readonly ticketService: TicketService,
    private readonly taskService: TaskService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {
    this.user = 1;
  }

  @Post()
  create() {
    return { message: 'cron task sTart' };
  }

  @Get()
  async findAll() {
    const score = Date.now();
    await this.redis.zadd(
      `waiting:concert:${this.ticketQueueKey}`,
      score,
      `User${this.user}`,
    );
    // await this.redis.expire(`waiting:concert:${this.ticketQueueKey}`, 60);

    this.user += 1;
    return `User${this.user}`;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.redis.del(`waiting:concert:${this.ticketQueueKey}`);
    await this.redis.del(this.purchaseQueueKey);
    // this.taskService.startQueSet();
    this.taskService.addCronJob();
    return { message: 'cron task sTarㅂㅈㄷㅂㅈㄷt' };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }
}
