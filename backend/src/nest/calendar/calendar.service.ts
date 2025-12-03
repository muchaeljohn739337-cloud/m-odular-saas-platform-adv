import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCalendarDto, CreateEventDto, UpdateEventDto } from "./dto/calendar.dto";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location: string | null;
  color: string | null;
  recurring: string | null;
  reminders: string | null;
  calendarId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
}

export interface PaginatedEvents {
  events: CalendarEvent[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Calendars ====================

  async createCalendar(userId: string, dto: CreateCalendarDto): Promise<Calendar> {
    // Check if this is the first calendar (make it default)
    const existingCalendars = await this.prisma.calendar.count({
      where: { userId },
    });

    const calendar = await this.prisma.calendar.create({
      data: {
        name: dto.name,
        color: dto.color || "#3B82F6",
        isDefault: existingCalendars === 0,
        userId,
      },
    });

    return calendar;
  }

  async getCalendars(userId: string): Promise<Calendar[]> {
    return this.prisma.calendar.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async getDefaultCalendar(userId: string): Promise<Calendar> {
    let calendar = await this.prisma.calendar.findFirst({
      where: { userId, isDefault: true },
    });

    // Create default calendar if none exists
    if (!calendar) {
      calendar = await this.prisma.calendar.create({
        data: {
          name: "My Calendar",
          color: "#3B82F6",
          isDefault: true,
          userId,
        },
      });
    }

    return calendar;
  }

  async deleteCalendar(userId: string, calendarId: string): Promise<void> {
    const calendar = await this.prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }

    if (calendar.userId !== userId) {
      throw new ForbiddenException("Not authorized to delete this calendar");
    }

    if (calendar.isDefault) {
      throw new ForbiddenException("Cannot delete default calendar");
    }

    // Delete all events in this calendar first
    await this.prisma.calendarEvent.deleteMany({
      where: { calendarId },
    });

    await this.prisma.calendar.delete({
      where: { id: calendarId },
    });
  }

  // ==================== Events ====================

  async createEvent(userId: string, dto: CreateEventDto): Promise<CalendarEvent> {
    let calendarId = dto.calendarId;

    // Use default calendar if not specified
    if (!calendarId) {
      const defaultCalendar = await this.getDefaultCalendar(userId);
      calendarId = defaultCalendar.id;
    }

    // Verify calendar ownership
    const calendar = await this.prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar || calendar.userId !== userId) {
      throw new ForbiddenException("Invalid calendar");
    }

    const event = await this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        allDay: dto.allDay || false,
        location: dto.location,
        color: dto.color || calendar.color,
        recurring: dto.recurring,
        reminders: dto.reminders ? JSON.stringify(dto.reminders) : null,
        calendarId,
        userId,
      },
    });

    return event;
  }

  async getEvents(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    calendarId?: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedEvents> {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (calendarId) {
      where.calendarId = calendarId;
    }

    if (startDate && endDate) {
      where.OR = [
        {
          startTime: { gte: startDate, lte: endDate },
        },
        {
          endTime: { gte: startDate, lte: endDate },
        },
        {
          AND: [{ startTime: { lte: startDate } }, { endTime: { gte: endDate } }],
        },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: "asc" },
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return { events, total, page, limit };
  }

  async getEventById(userId: string, eventId: string): Promise<CalendarEvent> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.userId !== userId) {
      throw new ForbiddenException("Not authorized to view this event");
    }

    return event;
  }

  async updateEvent(userId: string, eventId: string, dto: UpdateEventDto): Promise<CalendarEvent> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.userId !== userId) {
      throw new ForbiddenException("Not authorized to update this event");
    }

    const updateData: Record<string, unknown> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.startTime !== undefined) updateData.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) updateData.endTime = new Date(dto.endTime);
    if (dto.allDay !== undefined) updateData.allDay = dto.allDay;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.recurring !== undefined) updateData.recurring = dto.recurring;
    if (dto.reminders !== undefined) updateData.reminders = JSON.stringify(dto.reminders);

    return this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: updateData,
    });
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.userId !== userId) {
      throw new ForbiddenException("Not authorized to delete this event");
    }

    await this.prisma.calendarEvent.delete({
      where: { id: eventId },
    });
  }

  // ==================== Utilities ====================

  async getUpcomingEvents(userId: string, days = 7): Promise<CalendarEvent[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: { gte: now, lte: futureDate },
      },
      orderBy: { startTime: "asc" },
      take: 20,
    });
  }

  async getTodayEvents(userId: string): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.calendarEvent.findMany({
      where: {
        userId,
        OR: [
          { startTime: { gte: today, lt: tomorrow } },
          { endTime: { gte: today, lt: tomorrow } },
          { AND: [{ startTime: { lte: today } }, { endTime: { gte: tomorrow } }] },
        ],
      },
      orderBy: { startTime: "asc" },
    });
  }
}
