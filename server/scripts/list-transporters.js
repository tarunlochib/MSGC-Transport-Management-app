const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listTransporters() {
  try {
    const transporters = await prisma.transporter.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        contactInfo: true
      }
    });

    console.log('Available transporters:');
    console.log('======================');
    transporters.forEach((transporter, index) => {
      console.log(`${index + 1}. ID: ${transporter.id}`);
      console.log(`   Name: ${transporter.name}`);
      console.log(`   Phone: ${transporter.phone || 'N/A'}`);
      console.log(`   Contact: ${transporter.contactInfo || 'N/A'}`);
      console.log('---');
    });

    // Look for transporter with GST 07AAUCS4940E1Z1
    console.log('\nLooking for transporter with GST: 07AAUCS4940E1Z1');
    const targetTransporter = transporters.find(t => 
      t.contactInfo && t.contactInfo.includes('07AAUCS4940E1Z1')
    );

    if (targetTransporter) {
      console.log(`Found target transporter: ${targetTransporter.name} (ID: ${targetTransporter.id})`);
    } else {
      console.log('Target transporter not found. Please check the GST number or create the transporter first.');
    }

  } catch (error) {
    console.error('Error listing transporters:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listTransporters();
