import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./repository";
import { SignupInput, LoginInput, UpdateProfileInput } from "./validation";
import { ActivityLogService } from "../activityLogs/service";
import { NotificationService } from "../notifications/service";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_do_not_use_in_prod";
const JWT_EXPIRES_IN = "1d";

export class AuthService {
  private authRepo = new AuthRepository();
  private activityLogService = new ActivityLogService();
  private notificationService = new NotificationService();

  async signup(data: SignupInput) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Business Rule: New signups default to EMPLOYEE. 
    // Handled safely by Prisma default, we just pass the hashed password.
    const user = await this.authRepo.createUser({
      ...data,
      password: hashedPassword,
    });

    // Exclude password from the returned user object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: LoginInput) {
    const user = await this.authRepo.findUserByEmail(data.email);
    if (!user || user.status !== "ACTIVE") {
      throw new Error("Invalid credentials or account inactive");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const { password, ...userWithoutPassword } = user;
    
    // Log action and generate notification
    await this.activityLogService.logAction(
      user.id,
      "LOGIN",
      "AUTH",
      `User ${user.email} logged in successfully.`
    );

    await this.notificationService.createNotification({
      userId: user.id,
      title: "Login Successful",
      message: "You have logged in successfully.",
      type: "INFO",
    });

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      const user = await this.authRepo.findUserById(decoded.id);
      
      if (!user || user.status !== "ACTIVE") {
        throw new Error("User not found or inactive");
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      return {
        token,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async getProfile(userId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return this.authRepo.update(userId, data);
  }

  async forgotPasswordPlaceholder(email: string) {
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      throw new Error("User with this email does not exist");
    }
    // Return placeholder instructions/token as required for the design
    return {
      message: "If a user with this email exists, a password reset link has been generated (placeholder).",
      resetTokenPlaceholder: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" })
    };
  }

  async getAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.authRepo.findAll(skip, limit);
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    return this.authRepo.update(id, data);
  }

  async delete(id: string) {
    return this.authRepo.delete(id);
  }
}