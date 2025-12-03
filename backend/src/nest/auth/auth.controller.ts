import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthResponse, AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: { user: { id: string; email: string; name: string; role: string } }) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout() {
    // JWT is stateless, client should discard token
    return { message: "Logged out successfully" };
  }
}
