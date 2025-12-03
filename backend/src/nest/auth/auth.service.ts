import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Check username
    const existingUsername = await this.prisma.users.findUnique({
      where: { username: dto.username || dto.email.split("@")[0] },
    });

    if (existingUsername) {
      throw new ConflictException("Username already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        username: dto.username || dto.email.split("@")[0],
        passwordHash: hashedPassword,
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        role: "USER",
        active: false, // Requires admin approval
        updatedAt: new Date(),
      },
    });

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if account is blocked
    if (user.blockedAt) {
      throw new UnauthorizedException("Account suspended");
    }

    // Check if account is active
    if (!user.active) {
      throw new UnauthorizedException("Account pending approval");
    }

    // Update last login
    await this.prisma.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
    };
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.active || user.blockedAt) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private generateToken(user: { id: string; email: string; role: string }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
