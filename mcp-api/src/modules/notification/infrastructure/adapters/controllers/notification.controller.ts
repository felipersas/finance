import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import type { NotificationServicePort } from '../../../domain/ports/notification-service.port';
import type { Notification, Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { JwtUser } from 'src/modules/auth/strategies/jwt.strategy';
import { PaginatedParamsDto } from 'src/common/dtos/paginated-params.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    @Inject('NotificationServicePort')
    private readonly notificationService: NotificationServicePort,
  ) {}

  @Get()
  async findAll(
    @Query() params: PaginatedParamsDto,
    @CurrentUser() user: JwtUser,
  ) {
    const data = await this.notificationService.findAll(params, user.userId);
    return {
      data,
      message: 'Notificações carregadas com sucesso',
    };
  }

  @Post()
  async create(
    @Body() data: Prisma.NotificationCreateInput,
    @CurrentUser() user: JwtUser,
  ): Promise<Notification> {
    const userId = user.userId;
    return await this.notificationService.create({
      ...data,
      date: new Date(data.date),
      user: {
        connect: {
          id: userId,
        },
      },
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    return await this.notificationService.update({ id }, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Notification> {
    return await this.notificationService.delete({ id });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return await this.notificationService.update({ id }, { read: true });
  }
}
