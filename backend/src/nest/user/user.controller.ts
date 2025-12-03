import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/user.dto";
import { PaginatedUsers, UserProfile, UserService } from "./user.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  async getProfile(@Request() req: { user: { id: string } }): Promise<UserProfile | null> {
    return this.userService.findById(req.user.id);
  }

  @Put("me")
  async updateProfile(@Request() req: { user: { id: string } }, @Body() dto: UpdateProfileDto): Promise<UserProfile> {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Get()
  async findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<PaginatedUsers> {
    return this.userService.findAll(page, limit);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<UserProfile | null> {
    return this.userService.findById(id);
  }

  @Put(":id/approve")
  async approveUser(@Param("id") id: string): Promise<UserProfile> {
    return this.userService.approveUser(id);
  }

  @Put(":id/suspend")
  async suspendUser(@Param("id") id: string): Promise<UserProfile> {
    return this.userService.suspendUser(id);
  }
}
