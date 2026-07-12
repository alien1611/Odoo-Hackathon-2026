"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const service_1 = require("./service");
const validation_1 = require("./validation");
class AuthController {
    authService = new service_1.AuthService();
    signup = async (req, res, next) => {
        try {
            const validatedData = validation_1.signupSchema.parse(req.body);
            const user = await this.authService.signup(validatedData);
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const validatedData = validation_1.loginSchema.parse(req.body);
            const result = await this.authService.login(validatedData);
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (_req, res, next) => {
        try {
            // In a stateless JWT architecture, logout is usually handled client-side 
            // by destroying the token.
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
                data: {},
            });
        }
        catch (error) {
            next(error);
        }
    };
    getProfile = async (req, res, next) => {
        try {
            // req.user is populated by the auth middleware
            const userId = req.user.id;
            const profile = await this.authService.getProfile(userId);
            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getAll = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await this.authService.getAll(page, limit);
            res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = await this.authService.getProfile(id);
            res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const data = await this.authService.signup(req.body);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = await this.authService.update(id, req.body);
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const id = req.params.id;
            await this.authService.delete(id);
            res.status(200).json({
                success: true,
                message: "User deleted successfully",
                data: {},
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=controller.js.map