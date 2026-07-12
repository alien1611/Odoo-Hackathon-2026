import { PrismaClient, User } from "@prisma/client";
import { SignupInput } from "./validation";

const prisma = new PrismaClient();

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<Omit<User, "password"> | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) return null;
    
    // Destructure to remove the password, return the rest safely
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } 

  async createUser(data: SignupInput & { password: string }): Promise<User> {
    return prisma.user.create({ data });
  }
}