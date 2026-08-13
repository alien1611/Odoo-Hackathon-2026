import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").max(100, "Department name cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  headId: z.string().uuid("Invalid User ID").optional().nullable().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;