import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import type { NotificationServicePort } from '../ports/notification-service.port';
import type { NotificationRepositoryPort } from '../ports/notification-repository.port';
import { InternalServerError } from 'src/common/errors/internal-server-error';
import { PaginatedParamsDto } from 'src/common/dtos/paginated-params.dto';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import type { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationService implements NotificationServicePort {
  constructor(
    @Inject('NotificationRepositoryPort')
    private readonly notificationRepository: NotificationRepositoryPort,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(
    params: PaginatedParamsDto,
    userId: string,
  ): Promise<PaginatedResponse<Notification>> {
    return this.notificationRepository.findAll(
      params.page,
      params.perPage,
      params.orderDirection ?? 'desc',
      userId,
    );
  }

  async findMany(userId?: string): Promise<Notification[]> {
    return await this.notificationRepository.findMany(
      userId ? { userId } : undefined,
    );
  }

  async findUnique(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification | null> {
    return await this.notificationRepository.findUnique(where);
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    const created = await this.notificationRepository.create(data);
    if (!created) {
      throw new InternalServerError('Falha ao criar notificação');
    }

    // If it's a reminder, send to OneSignal
    if (created.isReminder) {
      await this.sendToOneSignal(created);
    }

    return created;
  }

  async update(
    where: Prisma.NotificationWhereUniqueInput,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    const updated = await this.notificationRepository.update(where, data);
    if (!updated) {
      throw new InternalServerError('Falha ao atualizar notificação');
    }
    return updated;
  }

  async delete(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification> {
    return await this.notificationRepository.delete(where);
  }

  private async sendToOneSignal(notification: Notification): Promise<void> {
    const appId = this.configService.get<string>('ONESIGNAL_APP_ID');
    const apiKey = this.configService.get<string>('ONESIGNAL_API_KEY');

    if (!appId || !apiKey) {
      console.warn('OneSignal credentials not set, skipping push notification');
      return;
    }

    const sendAfter = notification.time
      ? `${notification.date.toISOString().split('T')[0]}T${notification.time}:00Z`
      : notification.date.toISOString();

    const payload: any = {
      app_id: appId,
      headings: {
        en: notification.title,
      },
      included_segments: ['All'],
      contents: { en: notification.description || notification.title },
      // Send to all subscribed users by omitting targeting parameters
    };

    // Add send_after if it's a future date
    const now = new Date();
    const notificationDate = new Date(sendAfter);
    if (notificationDate > now) {
      payload.send_after = sendAfter;
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          'https://api.onesignal.com/notifications?c=push',
          payload,
          {
            headers: {
              Authorization: `Key ${apiKey}`,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Failed to send OneSignal notification:', error);
      // Don't throw, as the notification is already created
    }
  }
}
