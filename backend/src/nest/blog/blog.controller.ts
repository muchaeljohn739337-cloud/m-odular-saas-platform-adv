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
import { BlogPost, BlogService, PaginatedPosts } from "./blog.service";
import { CreatePostDto, UpdatePostDto } from "./dto/blog.dto";

@ApiTags("blog")
@Controller("blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public endpoints
  @Get("posts")
  @ApiOperation({ summary: "Get all published posts (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Posts retrieved successfully" })
  async findAllPublished(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<PaginatedPosts> {
    return this.blogService.findAll(page, limit, "PUBLISHED");
  }

  @Get("posts/:slug")
  @ApiOperation({ summary: "Get post by slug" })
  @ApiResponse({ status: 200, description: "Post retrieved successfully" })
  @ApiResponse({ status: 404, description: "Post not found" })
  async findBySlug(@Param("slug") slug: string): Promise<BlogPost> {
    return this.blogService.findBySlug(slug);
  }

  // Protected endpoints (require auth)
  @Post("posts")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create new blog post" })
  @ApiResponse({ status: 201, description: "Post created successfully" })
  async create(@Request() req: { user: { id: string } }, @Body() dto: CreatePostDto): Promise<BlogPost> {
    return this.blogService.create(req.user.id, dto);
  }

  @Get("admin/posts")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all posts (admin, paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "status", required: false, type: String })
  @ApiResponse({ status: 200, description: "Posts retrieved successfully" })
  async findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("status") status?: string
  ): Promise<PaginatedPosts> {
    return this.blogService.findAll(page, limit, status);
  }

  @Get("admin/posts/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get post by ID (admin)" })
  @ApiResponse({ status: 200, description: "Post retrieved successfully" })
  @ApiResponse({ status: 404, description: "Post not found" })
  async findById(@Param("id") id: string): Promise<BlogPost> {
    return this.blogService.findById(id);
  }

  @Put("admin/posts/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update blog post" })
  @ApiResponse({ status: 200, description: "Post updated successfully" })
  async update(@Param("id") id: string, @Body() dto: UpdatePostDto): Promise<BlogPost> {
    return this.blogService.update(id, dto);
  }

  @Delete("admin/posts/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Delete blog post" })
  @ApiResponse({ status: 200, description: "Post deleted successfully" })
  async delete(@Param("id") id: string): Promise<{ message: string }> {
    await this.blogService.delete(id);
    return { message: "Post deleted successfully" };
  }

  @Put("admin/posts/:id/publish")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Publish blog post" })
  @ApiResponse({ status: 200, description: "Post published successfully" })
  async publish(@Param("id") id: string): Promise<BlogPost> {
    return this.blogService.publish(id);
  }

  @Put("admin/posts/:id/unpublish")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Unpublish blog post" })
  @ApiResponse({ status: 200, description: "Post unpublished successfully" })
  async unpublish(@Param("id") id: string): Promise<BlogPost> {
    return this.blogService.unpublish(id);
  }
}
