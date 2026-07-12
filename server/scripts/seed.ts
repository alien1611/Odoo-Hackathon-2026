import { prisma } from "../src/config/database";
import bcrypt from "bcrypt";

async function main() {
  // Create a default category with a REAL UUID
  await prisma.category.upsert({
    where: { id: "b8449c2a-b620-410a-85d7-1306de15c7ea" },
    update: {},
    create: {
      id: "b8449c2a-b620-410a-85d7-1306de15c7ea",
      name: "Laptops"
    }
  });

  // Create a default department with a REAL UUID
  await prisma.department.upsert({
    where: { id: "a212356c-0db7-4566-9e90-c266f8eb2190" },
    update: {},
    create: {
      id: "a212356c-0db7-4566-9e90-c266f8eb2190",
      name: "IT Department"
    }
  });

  // Hash password for default Admin
  const hashedAdminPassword = await bcrypt.hash("Password123!", 12);

  // Create a default Admin user linked to the IT Department
  await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@company.com",
      password: hashedAdminPassword,
      role: "ADMIN",
      designation: "Lead System Administrator",
      status: "ACTIVE",
      departmentId: "a212356c-0db7-4566-9e90-c266f8eb2190"
    }
  });

  console.log("✅ Seed completed: Mock Category, Department, and Admin User injected successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());