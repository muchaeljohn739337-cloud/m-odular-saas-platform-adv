import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface PaginatedUsers {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    active: true,
    createdAt: true,
    lastLogin: true,
  } as const;

  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: this.userSelect,
    });

    return user;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: this.userSelect,
    });

    return user;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedUsers> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: this.userSelect,
      }),
      this.prisma.users.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateProfile(id: string, data: { firstName?: string; lastName?: string }): Promise<UserProfile> {
    const user = await this.prisma.users.update({
      where: { id },
      data,
      select: this.userSelect,
    });

    return user;
  }

  async approveUser(id: string): Promise<UserProfile> {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.users.update({
      where: { id },
      data: { active: true },
      select: this.userSelect,
    });
  }

  async suspendUser(id: string): Promise<UserProfile> {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.users.update({
      where: { id },
      data: { active: false },
      select: this.userSelect,
    });
  }
}
