import { prisma } from "../src/config/database";
import bcrypt from "bcrypt";

async function main() {
  console.log("🧹 Resetting database to a clean, fresh state for production deployment...");

  // 1. Delete dependent transactional records
  await prisma.reportCache.deleteMany({});
  await prisma.auditRecord.deleteMany({});
  await prisma.auditCycle.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.assetHistory.deleteMany({});
  await prisma.transferRequest.deleteMany({});
  await prisma.assetAllocation.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.activityLog.deleteMany({});

  // 2. Unlink all department heads and user departmental associations
  await prisma.department.updateMany({
    data: { headId: null }
  });

  await prisma.user.updateMany({
    data: { departmentId: null }
  });

  // 3. Delete all test / fake users, preserving only the system Admin
  await prisma.user.deleteMany({
    where: {
      email: {
        not: "admin@company.com"
      }
    }
  });

  // 4. Ensure pristine Admin user exists
  const hashedAdminPassword = await bcrypt.hash("Password123!", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {
      name: "System Admin",
      password: hashedAdminPassword,
      role: "ADMIN",
      designation: "System Administrator",
      status: "ACTIVE",
      departmentId: null
    },
    create: {
      name: "System Admin",
      email: "admin@company.com",
      password: hashedAdminPassword,
      role: "ADMIN",
      designation: "System Administrator",
      status: "ACTIVE",
      departmentId: null
    }
  });

  // 5. Seed clean, real Department structures (all unassigned, ready for real personnel)
  const enterpriseDepartments = [
    {
      id: "a212356c-0db7-4566-9e90-c266f8eb2190",
      name: "Information Technology",
      description: "IT infrastructure, enterprise security, hardware provisioning, and systems management.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a1111111-0db7-4566-9e90-c266f8eb2191",
      name: "Human Resources",
      description: "Talent acquisition, employee lifecycle, workplace relations, and corporate culture.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a2222222-0db7-4566-9e90-c266f8eb2192",
      name: "Finance & Accounting",
      description: "Corporate budgeting, financial audits, payroll, taxation, and treasury.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a3333333-0db7-4566-9e90-c266f8eb2193",
      name: "Engineering & R&D",
      description: "Product software architecture, infrastructure engineering, and technological research.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a4444444-0db7-4566-9e90-c266f8eb2194",
      name: "Operations & Facilities",
      description: "Physical facilities, equipment logistics, operational workflows, and maintenance.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a5555555-0db7-4566-9e90-c266f8eb2195",
      name: "Marketing & Communications",
      description: "Brand campaigns, public relations, enterprise content, and market research.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a6666666-0db7-4566-9e90-c266f8eb2196",
      name: "Sales & Client Success",
      description: "Enterprise sales, client partnership management, and customer onboarding.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a7777777-0db7-4566-9e90-c266f8eb2197",
      name: "Legal & Compliance",
      description: "Corporate legal governance, contract reviews, intellectual property, and compliance.",
      status: "ACTIVE",
      headId: null
    },
    {
      id: "a8888888-0db7-4566-9e90-c266f8eb2198",
      name: "Procurement & Sourcing",
      description: "Supplier negotiations, purchase requisitions, and vendor contract lifecycle.",
      status: "ACTIVE",
      headId: null
    }
  ];

  for (const dept of enterpriseDepartments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: {
        name: dept.name,
        description: dept.description,
        status: dept.status,
        headId: null
      },
      create: dept
    });
  }

  // 6. Seed clean Categories
  const standardCategories = [
    {
      id: "b8449c2a-b620-410a-85d7-1306de15c7ea",
      name: "Laptops & Workstations",
      description: "High-performance enterprise laptops, desktops, and computing equipment."
    },
    {
      id: "c1111111-b620-410a-85d7-1306de15c7eb",
      name: "Servers & Cloud Hardware",
      description: "Rack servers, blade chassis, SAN storage arrays, and datacentre compute nodes."
    },
    {
      id: "c2222222-b620-410a-85d7-1306de15c7ec",
      name: "Networking & Telecommunications",
      description: "Managed switches, firewalls, Wi-Fi 6 access points, and VoIP hardware."
    },
    {
      id: "c3333333-b620-410a-85d7-1306de15c7ed",
      name: "Office Furniture & Ergonomics",
      description: "Desks, ergonomic chairs, conference tables, and acoustic fixtures."
    },
    {
      id: "c4444444-b620-410a-85d7-1306de15c7ee",
      name: "Audio/Visual & Conferencing",
      description: "Smart meeting boards, conference room cameras, and presentation displays."
    },
    {
      id: "c5555555-b620-410a-85d7-1306de15c7ef",
      name: "Fleet & Logistics Vehicles",
      description: "Corporate transportation, delivery vehicles, and executive shuttles."
    }
  ];

  for (const cat of standardCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, description: cat.description },
      create: cat
    });
  }

  // 7. Create 1 clean initial System Initialized activity log
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "SYSTEM_INITIALIZE",
      module: "SYSTEM",
      description: "Enterprise ERP System initialized with clean production blueprint."
    }
  });

  console.log("✅ Database reset complete!");
  console.log(`   - Sole User: admin@company.com (ADMIN)`);
  console.log(`   - Departments: ${enterpriseDepartments.length} (all unassigned, no fake staff)`);
  console.log(`   - Categories: ${standardCategories.length}`);
  console.log(`   - All fake notifications, logs, assets, bookings, audits deleted.`);
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
  })
  .finally(() => prisma.$disconnect());