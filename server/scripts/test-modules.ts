// server/scripts/test-modules.ts
import { prisma } from "../src/config/database";
import { AssetRepository } from "../src/modules/assets/repository";
import { AssetService } from "../src/modules/assets/service";
import { AssetAllocationRepository } from "../src/modules/allocation/repository";
import { AssetAllocationService } from "../src/modules/allocation/service";
import { AssetHistoryRepository } from "../src/modules/history/repository";
import { TransferRequestRepository } from "../src/modules/transfers/repository";
import { TransferRequestService } from "../src/modules/transfers/service";
import { BookingRepository } from "../src/modules/bookings/repository";
import { BookingService } from "../src/modules/bookings/service";
import { MaintenanceRepository } from "../src/modules/maintenance/repository";
import { MaintenanceService } from "../src/modules/maintenance/service";
import { AuditRepository } from "../src/modules/audit/repository";
import { AuditService } from "../src/modules/audit/service";
import { ReportsRepository } from "../src/modules/reports/repository";
import { ReportsService } from "../src/modules/reports/service";

async function runTests() {
  console.log("🛠️ Starting Integration Verification Tests...");

  // Setup Repositories & Services
  const assetRepo = new AssetRepository(prisma);
  const assetService = new AssetService(assetRepo);
  const historyRepo = new AssetHistoryRepository(prisma);
  const allocationRepo = new AssetAllocationRepository(prisma);
  const allocationService = new AssetAllocationService(allocationRepo, assetRepo, historyRepo);
  const transferRepo = new TransferRequestRepository(prisma);
  const transferService = new TransferRequestService(transferRepo, assetRepo, historyRepo);
  const bookingRepo = new BookingRepository(prisma);
  const bookingService = new BookingService(bookingRepo);
  const maintenanceRepo = new MaintenanceRepository(prisma);
  const maintenanceService = new MaintenanceService(maintenanceRepo, assetRepo, historyRepo);
  const auditRepo = new AuditRepository(prisma);
  const auditService = new AuditService(auditRepo, assetRepo, historyRepo);
  const reportsRepo = new ReportsRepository(prisma);
  const reportsService = new ReportsService(reportsRepo);

  // Fetch or Seed Category and Department
  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({ data: { name: "Laptops" } });
  }

  let department = await prisma.department.findFirst();
  if (!department) {
    department = await prisma.department.create({ data: { name: "IT Department" } });
  }

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: `test-${Date.now()}@company.com`,
        password: "secure_password",
        role: "ADMIN"
      }
    });
  }

  // Clean up any old test assets if they conflict
  const testTag = "AST-TEST-123";
  const testSerial = "SN-TEST-123";
  const existingAsset = await prisma.asset.findFirst({ where: { assetTag: testTag } });
  if (existingAsset) {
    await prisma.assetHistory.deleteMany({ where: { assetId: existingAsset.id } });
    await prisma.assetAllocation.deleteMany({ where: { assetId: existingAsset.id } });
    await prisma.transferRequest.deleteMany({ where: { assetId: existingAsset.id } });
    await prisma.maintenanceRequest.deleteMany({ where: { assetId: existingAsset.id } });
    await prisma.auditRecord.deleteMany({ where: { assetId: existingAsset.id } });
    await prisma.asset.delete({ where: { id: existingAsset.id } });
  }

  console.log("\n--- TEST 1: Create Asset & QR Code Generation ---");
  const asset = await assetService.onboardAsset({
    assetTag: testTag,
    serialNumber: testSerial,
    name: "ThinkPad T14",
    categoryId: category.id,
    departmentId: department.id,
    purchaseDate: new Date("2026-07-12"),
    purchaseCost: 1200,
    vendor: "Lenovo Store",
    location: "HQ Room 102",
    condition: "NEW"
  });
  console.log(`✅ Asset registered: ID: ${asset.id}, QR Code URL: ${asset.qrCode}`);

  console.log("\n--- TEST 2: Duplicate Asset Tag Prevention ---");
  try {
    await assetService.onboardAsset({
      assetTag: testTag,
      serialNumber: "SN-DIFFERENT",
      name: "Duplicate Tag Laptop",
      categoryId: category.id,
      departmentId: department.id,
      purchaseDate: new Date("2026-07-12"),
      purchaseCost: 1200,
      vendor: "Lenovo Store",
      location: "HQ Room 102",
      condition: "NEW"
    });
    console.log("❌ FAILED: Duplicate asset tag allowed.");
  } catch (err: any) {
    console.log(`✅ PASS: Correctly threw duplicate tag error: "${err.message}"`);
  }

  console.log("\n--- TEST 3: Duplicate Serial Number Prevention ---");
  try {
    await assetService.onboardAsset({
      assetTag: "AST-DIFFERENT",
      serialNumber: testSerial,
      name: "Duplicate Serial Laptop",
      categoryId: category.id,
      departmentId: department.id,
      purchaseDate: new Date("2026-07-12"),
      purchaseCost: 1200,
      vendor: "Lenovo Store",
      location: "HQ Room 102",
      condition: "NEW"
    });
    console.log("❌ FAILED: Duplicate serial number allowed.");
  } catch (err: any) {
    console.log(`✅ PASS: Correctly threw duplicate serial error: "${err.message}"`);
  }

  console.log("\n--- TEST 4: Allocate Asset ---");
  const allocation = await allocationService.allocateAsset({
    assetId: asset.id!,
    employeeId: user.id,
    allocatedBy: user.id,
    expectedReturnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    remarks: "Testing allocation workflow"
  });
  console.log(`✅ Asset allocated: status is ${allocation.status}`);
  const allocatedAsset = await assetRepo.findById(asset.id!);
  console.log(`Asset status updated in DB: ${allocatedAsset?.status}`);

  console.log("\n--- TEST 5: Allocate Non-Available Asset Prevention ---");
  try {
    await allocationService.allocateAsset({
      assetId: asset.id!,
      employeeId: user.id,
      allocatedBy: user.id,
      expectedReturnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });
    console.log("❌ FAILED: Allowed allocation of non-available asset.");
  } catch (err: any) {
    console.log(`✅ PASS: Correctly threw allocation conflict: "${err.message}"`);
  }

  console.log("\n--- TEST 6: Raise Maintenance Request ---");
  const maintenance = await maintenanceService.createRequest({
    assetId: asset.id!,
    reportedBy: user.id,
    issueTitle: "Bulging Battery",
    description: "Laptop bottom chassis is expanding slightly.",
    priority: "HIGH"
  });
  console.log(`✅ Maintenance request raised: status is ${maintenance.status}, priority is ${maintenance.priority}`);

  console.log("\n--- TEST 7: Start Repair / Change status to IN_PROGRESS ---");
  await maintenanceService.updateRequest(maintenance.id, user.id, {
    status: "IN_PROGRESS"
  });
  const inMaintAsset = await assetRepo.findById(asset.id!);
  console.log(`✅ Asset status updated to: ${inMaintAsset?.status} (Expected: UNDER_MAINTENANCE)`);

  console.log("\n--- TEST 8: Resolve Maintenance / Change status to RESOLVED ---");
  await maintenanceService.updateRequest(maintenance.id, user.id, {
    status: "RESOLVED"
  });
  const resolvedAsset = await assetRepo.findById(asset.id!);
  console.log(`✅ Asset status restored to: ${resolvedAsset?.status} (Expected: AVAILABLE)`);

  // Re-allocate it for testing returns/transfers
  await allocationService.allocateAsset({
    assetId: asset.id!,
    employeeId: user.id,
    allocatedBy: user.id,
    expectedReturnDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    remarks: "Re-allocated after maintenance"
  });

  console.log("\n--- TEST 9: Return Asset ---");
  const returnRecord = await allocationService.returnAsset({
    assetId: asset.id!,
    returnedBy: user.id,
    condition: "FAIR",
    remarks: "Returned with small scratch on lid"
  });
  console.log(`✅ Asset returned: allocation status is ${returnRecord.status}`);
  const returnedAsset = await assetRepo.findById(asset.id!);
  console.log(`Asset status updated: ${returnedAsset?.status}, Condition updated: ${returnedAsset?.condition}`);

  console.log("\n--- TEST 10: Create Transfer Request ---");
  const secondaryDept = await prisma.department.create({ data: { name: "Engineering Department - Test" } });
  const transferRequest = await transferService.createRequest({
    assetId: asset.id!,
    requestedBy: user.id,
    toDepartment: secondaryDept.id,
    reason: "Developer moving from IT to Engineering team"
  });
  console.log(`✅ Transfer request created: status is ${transferRequest.status}`);

  console.log("\n--- TEST 11: Approve Transfer Request ---");
  const approvedTransfer = await transferService.processRequest(transferRequest.id, {
    status: "APPROVED",
    approvedBy: user.id
  });
  console.log(`✅ Transfer request processed: status is ${approvedTransfer.status}`);
  const transferredAsset = await assetRepo.findById(asset.id!);
  console.log(`Asset department ID is now: ${transferredAsset?.departmentId} (Expected: ${secondaryDept.id})`);

  console.log("\n--- TEST 12: Booking Creation & Conflict Detection ---");
  const resourceId = "47e4567e-e89b-12d3-a456-426614174000";
  const start = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours from now
  const end = new Date(Date.now() + 1000 * 60 * 60 * 4); // 4 hours from now

  const booking = await bookingService.createBooking({
    resourceId,
    resourceType: "Meeting Room",
    bookedBy: user.id,
    startTime: start,
    endTime: end,
    purpose: "Team brainstorming session"
  });
  console.log(`✅ Booking created successfully: ID: ${booking.id}`);

  console.log("\n--- TEST 13: Booking Overlap Conflict Rejection ---");
  try {
    const overlappingStart = new Date(Date.now() + 1000 * 60 * 60 * 3); // 3 hours (overlaps!)
    const overlappingEnd = new Date(Date.now() + 1000 * 60 * 60 * 5); // 5 hours

    await bookingService.createBooking({
      resourceId,
      resourceType: "Meeting Room",
      bookedBy: user.id,
      startTime: overlappingStart,
      endTime: overlappingEnd,
      purpose: "Conflicting project check-in"
    });
    console.log("❌ FAILED: Overlapping booking allowed.");
  } catch (err: any) {
    console.log(`✅ PASS: Correctly rejected overlapping booking: "${err.message}"`);
  }

  console.log("\n--- TEST 14: Audit Cycle Verification (Asset Lost Workflow) ---");
  const auditCycle = await auditService.createCycle({
    name: "Annual Dev Machine Verification",
    scope: "Testing verification workflows",
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    createdBy: user.id
  });
  await auditService.updateCycle(auditCycle.id, { status: "ACTIVE" });

  const auditRecord = await auditService.verifyAsset(auditCycle.id, user.id, {
    assetId: asset.id!,
    verificationStatus: "MISSING",
    remarks: "Laptop not found at desk during physical audit check"
  });
  console.log(`✅ Verification logged: status is ${auditRecord.verificationStatus}`);
  const auditedAsset = await assetRepo.findById(asset.id!);
  console.log(`Asset status updated to LOST in DB: ${auditedAsset?.status}`);

  console.log("\n--- TEST 15: Dashboard Reports Summary & CSV Compilation ---");
  const reportData = await reportsService.getDashboardSummary();
  console.log(`✅ Dashboard summary gathered. KPIs: ${JSON.stringify(reportData.kpi)}`);

  const bookingsCsv = await reportsService.exportBookingsCsv();
  console.log(`✅ Bookings CSV Compiled successfully: (first 2 lines shown below):\n${bookingsCsv.split("\n").slice(0, 2).join("\n")}`);

  // Clean up
  await prisma.assetHistory.deleteMany({ where: { assetId: asset.id! } });
  await prisma.assetAllocation.deleteMany({ where: { assetId: asset.id! } });
  await prisma.transferRequest.deleteMany({ where: { assetId: asset.id! } });
  await prisma.maintenanceRequest.deleteMany({ where: { assetId: asset.id! } });
  await prisma.auditRecord.deleteMany({ where: { auditCycleId: auditCycle.id } });
  await prisma.auditCycle.delete({ where: { id: auditCycle.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.asset.delete({ where: { id: asset.id! } });
  await prisma.department.delete({ where: { id: secondaryDept.id } });

  console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
}

runTests().catch(e => console.error("❌ Test runner error:", e)).finally(() => prisma.$disconnect());
