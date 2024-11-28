import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TaskService } from '../cron/cron.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService, TaskService],
})
export class TicketModule {}
