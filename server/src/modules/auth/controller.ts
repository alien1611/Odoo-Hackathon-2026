import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./service";
import { signupSchema, loginSchema, updateProfileSchema, refreshTokenSchema, forgotPasswordSchema } from "./validation";

export class AuthController {
  private authService = new AuthService();

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const user = await this.authService.signup(validatedData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In a stateless JWT architecture, logout is usually handled client-side 
      // by destroying the token.
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is populated by the auth middleware
      const userId = (req as any).user.id; 
      const profile = await this.authService.getProfile(userId);

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await this.authService.updateProfile(userId, validatedData);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const data = await this.authService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await this.authService.forgotPasswordPlaceholder(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          resetTokenPlaceholder: result.resetTokenPlaceholder,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.authService.getAll(page, limit);
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.authService.getProfile(id);
      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.authService.signup(req.body);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.authService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.authService.delete(id);
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };
}