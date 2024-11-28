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
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  @Get()
  async findAll() {
    await this.redis.set('key', 'Redis data!');
    const redisData = await this.redis.get('key');
    console.log(redisData);
    return { redisData };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id };
    // return this.ticketService.findOne(+id);
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
