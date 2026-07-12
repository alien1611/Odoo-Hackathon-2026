import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  description: z.string().optional(),
  headId: z.string().uuid("Invalid User ID").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;