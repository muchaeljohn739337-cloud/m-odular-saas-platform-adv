import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Calendar, CalendarEvent, CalendarService, PaginatedEvents } from "./calendar.service";
import { CreateCalendarDto, CreateEventDto, UpdateEventDto } from "./dto/calendar.dto";

@Controller("calendar")
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // ==================== Calendars ====================

  @Post("calendars")
  async createCalendar(@Request() req: { user: { id: string } }, @Body() dto: CreateCalendarDto): Promise<Calendar> {
    return this.calendarService.createCalendar(req.user.id, dto);
  }

  @Get("calendars")
  async getCalendars(@Request() req: { user: { id: string } }): Promise<Calendar[]> {
    return this.calendarService.getCalendars(req.user.id);
  }

  @Delete("calendars/:id")
  async deleteCalendar(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ): Promise<{ message: string }> {
    await this.calendarService.deleteCalendar(req.user.id, id);
    return { message: "Calendar deleted successfully" };
  }

  // ==================== Events ====================

  @Post("events")
  async createEvent(@Request() req: { user: { id: string } }, @Body() dto: CreateEventDto): Promise<CalendarEvent> {
    return this.calendarService.createEvent(req.user.id, dto);
  }

  @Get("events")
  async getEvents(
    @Request() req: { user: { id: string } },
    @Query("start") start?: string,
    @Query("end") end?: string,
    @Query("calendarId") calendarId?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit?: number
  ): Promise<PaginatedEvents> {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    return this.calendarService.getEvents(req.user.id, startDate, endDate, calendarId, page, limit);
  }

  @Get("events/today")
  async getTodayEvents(@Request() req: { user: { id: string } }): Promise<CalendarEvent[]> {
    return this.calendarService.getTodayEvents(req.user.id);
  }

  @Get("events/upcoming")
  async getUpcomingEvents(
    @Request() req: { user: { id: string } },
    @Query("days", new DefaultValuePipe(7), ParseIntPipe) days: number
  ): Promise<CalendarEvent[]> {
    return this.calendarService.getUpcomingEvents(req.user.id, days);
  }

  @Get("events/:id")
  async getEvent(@Request() req: { user: { id: string } }, @Param("id") id: string): Promise<CalendarEvent> {
    return this.calendarService.getEventById(req.user.id, id);
  }

  @Put("events/:id")
  async updateEvent(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateEventDto
  ): Promise<CalendarEvent> {
    return this.calendarService.updateEvent(req.user.id, id, dto);
  }

  @Delete("events/:id")
  async deleteEvent(@Request() req: { user: { id: string } }, @Param("id") id: string): Promise<{ message: string }> {
    await this.calendarService.deleteEvent(req.user.id, id);
    return { message: "Event deleted successfully" };
  }
}
