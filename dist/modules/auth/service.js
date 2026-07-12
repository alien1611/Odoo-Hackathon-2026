"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const repository_1 = require("./repository");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";
const JWT_EXPIRES_IN = "1d";
class AuthService {
    authRepo = new repository_1.AuthRepository();
    async signup(data) {
        const existingUser = await this.authRepo.findUserByEmail(data.email);
        if (existingUser) {
            throw new Error("Email already registered");
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
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
    async login(data) {
        const user = await this.authRepo.findUserByEmail(data.email);
        if (!user || user.status !== "ACTIVE") {
            throw new Error("Invalid credentials or account inactive");
        }
        const isValidPassword = await bcrypt_1.default.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };
    }
    async getProfile(userId) {
        const user = await this.authRepo.findUserById(userId);
        if (!user)
            throw new Error("User not found");
        return user;
    }
    async getAll(page, limit) {
        const skip = (page - 1) * limit;
        return this.authRepo.findAll(skip, limit);
    }
    async update(id, data) {
        if (data.password) {
            data.password = await bcrypt_1.default.hash(data.password, 12);
        }
        return this.authRepo.update(id, data);
    }
    async delete(id) {
        return this.authRepo.delete(id);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map