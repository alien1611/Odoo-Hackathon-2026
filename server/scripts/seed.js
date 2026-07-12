"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../server/src/config/database");
async function main() {
    // Create a default category with a REAL UUID
    await database_1.prisma.category.upsert({
        where: { id: 'b8449c2a-b620-410a-85d7-1306de15c7ea' },
        update: {},
        create: {
            id: 'b8449c2a-b620-410a-85d7-1306de15c7ea',
            name: 'Laptops'
        }
    });
    // Create a default department with a REAL UUID
    await database_1.prisma.department.upsert({
        where: { id: 'a212356c-0db7-4566-9e90-c266f8eb2190' },
        update: {},
        create: {
            id: 'a212356c-0db7-4566-9e90-c266f8eb2190',
            name: 'IT Department'
        }
    });
    console.log('✅ Real Mock Category and Department injected successfully!');
}
main().catch(e => console.error(e)).finally(() => database_1.prisma.$disconnect());
//# sourceMappingURL=seed.js.map