const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createGodownsForTransporter() {
  try {
    // Find the transporter with GST number 07AAUCS4940E1Z1
    const transporter = await prisma.transporter.findFirst({
      where: { 
        // Assuming the GST number is stored in a field, we need to check the actual field name
        // For now, let's find by name or create a test transporter
        name: {
          contains: 'Suraj' // Adjust this based on your actual transporter name
        }
      }
    });

    if (!transporter) {
      console.log('Transporter not found. Please create the transporter first or update the search criteria.');
      return;
    }

    console.log(`Found transporter: ${transporter.name} (ID: ${transporter.id})`);

    // Define godowns with their cities
    const godownsData = [
      {
        name: "Godown 1",
        cities: [
          "Bihar Sharif", "Gaya", "Sasaram", "Nawadam Munger", 
          "Raxaul", "Motihari", "Dumraon", "Bettiah", 
          "Patna Junction", "Patna City", "Arrah", "Buxar", 
          "Aurangabad", "Dehri On Sone", "Jehanabad", 
          "Lakhisarai", "Jamui", "Bhabhua"
        ]
      },
      {
        name: "Godown 2",
        cities: [
          "Gulab Bagh", "Katihar", "Araria", "Jogbani", 
          "Forbesganj", "Saharsa", "Supaul", "Purnia", 
          "Muzaffarpur", "Darbhanga", "Begusarai", "Samastipur", 
          "Sitamarhi", "Chapra", "Hajipur", "Siwan", 
          "Gopal Ganj", "Jai Nagar", "Kishan Ganj", "Madhubani", 
          "Khagaria", "Naugachia", "Bhagalpur"
        ]
      },
      {
        name: "JK Godown",
        cities: [
          // Jharkhand cities
          "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", 
          "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", 
          "Chatra", "Koderma", "Gumla", "Lohardaga", "Simdega", 
          "Latehar", "Palamu", "Garhwa", "Sahibganj", "Pakur", 
          "Dumka", "Jamtara", "Godda", "Khunti", "Seraikela Kharsawan", 
          "West Singhbhum", "East Singhbhum",
          
          // West Bengal cities (major ones)
          "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", 
          "Bardhaman", "Malda", "Bahrampur", "Habra", "Kharagpur", 
          "Shantipur", "Dankuni", "Dhulian", "Ranaghat", "Haldia", 
          "Raiganj", "Krishnanagar", "Nabadwip", "Medinipur", "Jalpaiguri", 
          "Balurghat", "Basirhat", "Bankura", "Chakdaha", "Darjeeling", 
          "Alipurduar", "Purulia", "Jangipur", "Bangaon", "Cooch Behar"
        ]
      }
    ];

    // Create godowns
    for (const godownData of godownsData) {
      const existingGodown = await prisma.godown.findFirst({
        where: {
          name: godownData.name,
          transporterId: transporter.id
        }
      });

      if (existingGodown) {
        console.log(`Godown "${godownData.name}" already exists for this transporter.`);
        continue;
      }

      const godown = await prisma.godown.create({
        data: {
          name: godownData.name,
          transporterId: transporter.id,
          cities: JSON.stringify(godownData.cities),
          status: 'Active'
        }
      });

      console.log(`Created godown: ${godown.name} with ${godownData.cities.length} cities`);
    }

    console.log('Godown creation completed successfully!');
  } catch (error) {
    console.error('Error creating godowns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createGodownsForTransporter();
