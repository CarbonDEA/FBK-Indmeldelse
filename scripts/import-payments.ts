#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error('Usage: tsx import-payments.ts <path-to-csv>');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  console.log(`Processing ${lines.length - 1} payments...`);

  let processed = 0;
  let failed = 0;

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const [externalRef, amountStr, dateStr] = lines[i].split(',');

    try {
      const payment = await prisma.payment.findFirst({
        where: { externalRef: externalRef?.trim() },
      });

      if (!payment) {
        console.warn(`Payment not found for ref: ${externalRef}`);
        failed++;
        continue;
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paid: true,
          paidAt: new Date(dateStr?.trim()),
          method: 'bank_transfer',
        },
      });

      await prisma.auditLog.create({
        data: {
          actor: 'csv_import',
          action: 'PAYMENT_IMPORTED',
          entity: 'Payment',
          entityId: payment.id,
          payload: { externalRef, amount: parseInt(amountStr) },
        },
      });

      processed++;
    } catch (error) {
      console.error(`Failed to process line ${i}: ${error.message}`);
      failed++;
    }
  }

  console.log(`✅ Processed: ${processed}`);
  console.log(`❌ Failed: ${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
