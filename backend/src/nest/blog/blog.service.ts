import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto, UpdatePostDto } from "./dto/blog.dto";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  featuredImage: string | null;
  authorId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPosts {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, dto: CreatePostDto): Promise<BlogPost> {
    const slug = this.generateSlug(dto.title);

    const post = await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        status: dto.status || "DRAFT",
        featuredImage: dto.featuredImage,
        authorId,
        publishedAt: dto.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return post;
  }

  async findAll(page = 1, limit = 10, status?: string): Promise<PaginatedPosts> {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    // Increment view count
    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async findById(id: string): Promise<BlogPost> {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }

  async update(id: string, dto: UpdatePostDto): Promise<BlogPost> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Post not found");
    }

    const updateData: Record<string, unknown> = { ...dto };

    // Update slug if title changed
    if (dto.title && dto.title !== existing.title) {
      updateData.slug = this.generateSlug(dto.title);
    }

    // Set publishedAt if publishing for first time
    if (dto.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    await this.prisma.blogPost.delete({ where: { id } });
  }

  async publish(id: string): Promise<BlogPost> {
    return this.update(id, { status: "PUBLISHED" });
  }

  async unpublish(id: string): Promise<BlogPost> {
    return this.update(id, { status: "DRAFT" });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 100);
  }
}
