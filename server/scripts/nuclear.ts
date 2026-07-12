import { prisma } from '../src/config/database';

async function main() {
  console.log("⏳ Forcing new records into the database...");

  // 1. Let the database create a Category and generate a perfect UUID
  const category = await prisma.category.create({
    data: { name: 'Laptops - ' + Date.now() } 
  });

  // 2. Let the database create a Department and generate a perfect UUID
  const department = await prisma.department.create({
    data: { name: 'IT Dept - ' + Date.now() }
  });

  // 3. Generate a payload guaranteed to pass every validation rule
  const randomId = Math.floor(Math.random() * 9999);
  
  const payload = {
    assetTag: `AST-2026-${randomId}`,
    serialNumber: `SN-XPS-${randomId}`,
    name: "Dell XPS 15 Laptop",
    description: "Guaranteed to work test machine",
    categoryId: category.id,
    departmentId: department.id,
    purchaseDate: "2026-07-12",
    purchaseCost: 1499.99,
    vendor: "Dell Enterprise Solutions",
    warrantyExpiry: "2029-07-12",
    location: "Main Campus - Server Room 3B",
    condition: "NEW"
  };

  console.log('\n✅ SUCCESS! COPY THIS EXACT JSON INTO THUNDER CLIENT:\n');
  console.log(JSON.stringify(payload, null, 2));
}

main()
  .catch(e => console.error("❌ Error:", e))
  .finally(() => prisma.$disconnect());