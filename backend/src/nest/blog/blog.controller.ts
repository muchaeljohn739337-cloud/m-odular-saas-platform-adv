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
import { BlogPost, BlogService, PaginatedPosts } from "./blog.service";
import { CreatePostDto, UpdatePostDto } from "./dto/blog.dto";

@Controller("blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public endpoints
  @Get("posts")
  async findAllPublished(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<PaginatedPosts> {
    return this.blogService.findAll(page, limit, "PUBLISHED");
  }

  @Get("posts/:slug")
  async findBySlug(@Param("slug") slug: string): Promise<BlogPost> {
    return this.blogService.findBySlug(slug);
  }

  // Protected endpoints (require auth)
  @Post("posts")
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: { user: { id: string } }, @Body() dto: CreatePostDto): Promise<BlogPost> {
    return this.blogService.create(req.user.id, dto);
  }

  @Get("admin/posts")
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("status") status?: string
  ): Promise<PaginatedPosts> {
    return this.blogService.findAll(page, limit, status);
  }

  @Get("admin/posts/:id")
  @UseGuards(JwtAuthGuard)
  async findById(@Param("id") id: string): Promise<BlogPost> {
    return this.blogService.findById(id);
  }

  @Put("admin/posts/:id")
  @UseGuards(JwtAuthGuard)
  async update(@Param("id") id: string, @Body() dto: UpdatePostDto): Promise<BlogPost> {
    return this.blogService.update(id, dto);
  }

  @Delete("admin/posts/:id")
  @UseGuards(JwtAuthGuard)
  async delete(@Param("id") id: string): Promise<{ message: string }> {
    await this.blogService.delete(id);
    return { message: "Post deleted successfully" };
  }

  @Put("admin/posts/:id/publish")
  @UseGuards(JwtAuthGuard)
  async publish(@Param("id") id: string): Promise<BlogPost> {
    return this.blogService.publish(id);
  }

  @Put("admin/posts/:id/unpublish")
  @UseGuards(JwtAuthGuard)
  async unpublish(@Param("id") id: string): Promise<BlogPost> {
    return this.blogService.unpublish(id);
  }
}
