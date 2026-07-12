import { Request, Response } from "express";

export class CategoryController {
  getAll = async (_req: Request, res: Response) => { res.status(200).json({ data: [] }); };
  create = async (_req: Request, res: Response) => { res.status(201).json({ data: {} }); };
  update = async (_req: Request, res: Response) => { res.status(200).json({ data: {} }); };
}