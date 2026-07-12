import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./repository";
import { SignupInput, LoginInput } from "./validation";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";
const JWT_EXPIRES_IN = "1d";

export class AuthService {
  private authRepo = new AuthRepository();

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

    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }
}