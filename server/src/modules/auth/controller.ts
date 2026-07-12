import { Request, Response } from "express";
import { AuthService } from "./service";
import { signupSchema, loginSchema } from "./validation";

export class AuthController {
  private authService = new AuthService();

  signup = async (req: Request, res: Response) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const user = await this.authService.signup(validatedData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Registration failed",
        error: error.errors || error.message,
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: "Authentication failed",
        error: error.message,
      });
    }
  };

  logout = async (_req: Request, res: Response) => {
    // In a stateless JWT architecture, logout is usually handled client-side 
    // by destroying the token. If blacklisting is needed, it will be added to Redis later.
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      data: {},
    });
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      // req.user is populated by the auth middleware
      const userId = (req as any).user.id; 
      const profile = await this.authService.getProfile(userId);

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: "Profile retrieval failed",
        error: error.message,
      });
    }
  };
}