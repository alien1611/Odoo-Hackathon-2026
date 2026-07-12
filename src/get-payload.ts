import { prisma } from './config/database';

async function main() {
  // Fetch the first category and department from the actual database
  const category = await prisma.category.findFirst();
  const department = await prisma.department.findFirst();

  if (!category || !department) {
    console.log("❌ Error: Database is empty. Please run 'npx tsx src/seed.ts' first.");
    return;
  }

  console.log('\n✅ SUCCESS! COPY THIS EXACT JSON INTO THUNDER CLIENT:\n');
  console.log(JSON.stringify({
    assetTag: "AST-2026-002", 
    serialNumber: "SN-XPS15-112233",
    name: "Dell XPS 15 Laptop",
    description: "Developer machine assigned to engineering core team",
    categoryId: category.id,
    departmentId: department.id,
    purchaseDate: "2026-07-12",
    purchaseCost: 1499.99,
    vendor: "Dell Enterprise Solutions",
    warrantyExpiry: "2029-07-12",
    location: "Main Campus - Server Room 3B",
    condition: "NEW"
  }, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());