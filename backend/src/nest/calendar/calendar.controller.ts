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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Calendar, CalendarEvent, CalendarService, PaginatedEvents } from "./calendar.service";
import { CreateCalendarDto, CreateEventDto, UpdateEventDto } from "./dto/calendar.dto";

@ApiTags("calendar")
@ApiBearerAuth("JWT-auth")
@Controller("calendar")
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // ==================== Calendars ====================

  @Post("calendars")
  @ApiOperation({ summary: "Create new calendar" })
  @ApiResponse({ status: 201, description: "Calendar created successfully" })
  async createCalendar(@Request() req: { user: { id: string } }, @Body() dto: CreateCalendarDto): Promise<Calendar> {
    return this.calendarService.createCalendar(req.user.id, dto);
  }

  @Get("calendars")
  @ApiOperation({ summary: "Get all user calendars" })
  @ApiResponse({ status: 200, description: "Calendars retrieved successfully" })
  async getCalendars(@Request() req: { user: { id: string } }): Promise<Calendar[]> {
    return this.calendarService.getCalendars(req.user.id);
  }

  @Delete("calendars/:id")
  @ApiOperation({ summary: "Delete calendar" })
  @ApiResponse({ status: 200, description: "Calendar deleted successfully" })
  async deleteCalendar(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ): Promise<{ message: string }> {
    await this.calendarService.deleteCalendar(req.user.id, id);
    return { message: "Calendar deleted successfully" };
  }

  // ==================== Events ====================

  @Post("events")
  @ApiOperation({ summary: "Create new event" })
  @ApiResponse({ status: 201, description: "Event created successfully" })
  async createEvent(@Request() req: { user: { id: string } }, @Body() dto: CreateEventDto): Promise<CalendarEvent> {
    return this.calendarService.createEvent(req.user.id, dto);
  }

  @Get("events")
  @ApiOperation({ summary: "Get events with optional filters (paginated)" })
  @ApiQuery({ name: "start", required: false, type: String, description: "Start date filter" })
  @ApiQuery({ name: "end", required: false, type: String, description: "End date filter" })
  @ApiQuery({ name: "calendarId", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
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
  @ApiOperation({ summary: "Get today's events" })
  @ApiResponse({ status: 200, description: "Today's events retrieved" })
  async getTodayEvents(@Request() req: { user: { id: string } }): Promise<CalendarEvent[]> {
    return this.calendarService.getTodayEvents(req.user.id);
  }

  @Get("events/upcoming")
  @ApiOperation({ summary: "Get upcoming events" })
  @ApiQuery({ name: "days", required: false, type: Number, description: "Number of days ahead (default: 7)" })
  @ApiResponse({ status: 200, description: "Upcoming events retrieved" })
  async getUpcomingEvents(
    @Request() req: { user: { id: string } },
    @Query("days", new DefaultValuePipe(7), ParseIntPipe) days: number
  ): Promise<CalendarEvent[]> {
    return this.calendarService.getUpcomingEvents(req.user.id, days);
  }

  @Get("events/:id")
  @ApiOperation({ summary: "Get event by ID" })
  @ApiResponse({ status: 200, description: "Event retrieved successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  async getEvent(@Request() req: { user: { id: string } }, @Param("id") id: string): Promise<CalendarEvent> {
    return this.calendarService.getEventById(req.user.id, id);
  }

  @Put("events/:id")
  @ApiOperation({ summary: "Update event" })
  @ApiResponse({ status: 200, description: "Event updated successfully" })
  async updateEvent(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateEventDto
  ): Promise<CalendarEvent> {
    return this.calendarService.updateEvent(req.user.id, id, dto);
  }

  @Delete("events/:id")
  @ApiOperation({ summary: "Delete event" })
  @ApiResponse({ status: 200, description: "Event deleted successfully" })
  async deleteEvent(@Request() req: { user: { id: string } }, @Param("id") id: string): Promise<{ message: string }> {
    await this.calendarService.deleteEvent(req.user.id, id);
    return { message: "Event deleted successfully" };
  }
}
