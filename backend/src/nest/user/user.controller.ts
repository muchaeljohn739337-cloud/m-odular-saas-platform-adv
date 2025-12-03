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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/user.dto";
import { PaginatedUsers, UserProfile, UserService } from "./user.service";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  async getProfile(@Request() req: { user: { id: string } }): Promise<UserProfile | null> {
    return this.userService.findById(req.user.id);
  }

  @Put("me")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(@Request() req: { user: { id: string } }, @Body() dto: UpdateProfileDto): Promise<UserProfile> {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all users (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number (default: 1)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page (default: 10)" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  async findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<PaginatedUsers> {
    return this.userService.findAll(page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User retrieved successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id") id: string): Promise<UserProfile | null> {
    return this.userService.findById(id);
  }

  @Put(":id/approve")
  @ApiOperation({ summary: "Approve user account" })
  @ApiResponse({ status: 200, description: "User approved successfully" })
  async approveUser(@Param("id") id: string): Promise<UserProfile> {
    return this.userService.approveUser(id);
  }

  @Put(":id/suspend")
  @ApiOperation({ summary: "Suspend user account" })
  @ApiResponse({ status: 200, description: "User suspended successfully" })
  async suspendUser(@Param("id") id: string): Promise<UserProfile> {
    return this.userService.suspendUser(id);
  }
}
