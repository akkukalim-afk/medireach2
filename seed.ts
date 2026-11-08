import { PrismaClient, Role, MedicineCategory, PrescriptionStatus, OrderStatus, DeliveryStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MediReach database seed...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Core Users for each Role
  const customer = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'customer@medireach.in',
      passwordHash,
      role: Role.CUSTOMER,
      phone: '+91 98450 12345',
      addresses: {
        create: {
          label: 'Home',
          addressLine: 'Flat 402, Prestige Shantiniketan, Sector A',
          locality: 'Yelahanka New Town',
          city: 'Bengaluru',
          pincode: '560064',
          lat: 13.1000,
          lng: 77.5950,
          isDefault: true,
        },
      },
    },
  });

  const apolloOwner = await prisma.user.create({
    data: {
      name: 'Dr. Ramesh Kumar (Pharmacist)',
      email: 'apollo@medireach.in',
      passwordHash,
      role: Role.PHARMACY_OWNER,
      phone: '+91 98451 22334',
    },
  });

  const medplusOwner = await prisma.user.create({
    data: {
      name: 'Suresh Gowda',
      email: 'medplus@medireach.in',
      passwordHash,
      role: Role.PHARMACY_OWNER,
      phone: '+91 98452 33445',
    },
  });

  const deliveryPartner = await prisma.user.create({
    data: {
      name: 'Kiran Nayak (Delivery Partner)',
      email: 'delivery@medireach.in',
      passwordHash,
      role: Role.DELIVERY_PARTNER,
      phone: '+91 98453 44556',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'MediReach Administrator',
      email: 'admin@medireach.in',
      passwordHash,
      role: Role.ADMIN,
      phone: '+91 80 2846 0000',
    },
  });

  // Additional pharmacy owners
  const owner3 = await prisma.user.create({
    data: { name: 'Pooja Hegde', email: 'aster@medireach.in', passwordHash, role: Role.PHARMACY_OWNER, phone: '+91 98454 55667' },
  });
  const owner4 = await prisma.user.create({
    data: { name: 'Manish Verma', email: 'trust@medireach.in', passwordHash, role: Role.PHARMACY_OWNER, phone: '+91 98455 66778' },
  });
  const owner5 = await prisma.user.create({
    data: { name: 'Anita Rao', email: 'guardian@medireach.in', passwordHash, role: Role.PHARMACY_OWNER, phone: '+91 98456 77889' },
  });
  const owner6 = await prisma.user.create({
    data: { name: 'Venkatesh Murthy', email: 'wellness@medireach.in', passwordHash, role: Role.PHARMACY_OWNER, phone: '+91 98457 88990' },
  });
  const owner7 = await prisma.user.create({
    data: { name: 'Naveen Reddy', email: 'sanjivani@medireach.in', passwordHash, role: Role.PHARMACY_OWNER, phone: '+91 98458 99001' },
  });
  const owner8 = await prisma.user.create({
    data: { name: 'Geetha Bai', email: 'janaushadhi@medireach.in', passwordHash, role: Role.PHARMACY_OWNER, phone: '+91 98459 00112' },
  });

  // 2. Create 8 Realistic Yelahanka Pharmacies
  const pharmaciesData = [
    {
      name: 'Apollo Pharmacy – Yelahanka New Town',
      licenseNumber: 'KA-BGL-2023-AP8812',
      ownerId: apolloOwner.id,
      address: 'Shop 4, 16th B Cross, Major Sandeep Unnikrishnan Road, Yelahanka New Town',
      landmark: 'Near Sheshadripuram College',
      lat: 13.1007,
      lng: 77.5963,
      phone: '+91 80 2856 7100',
      rating: 4.8,
      prepTimeMinutes: 12,
    },
    {
      name: 'MedPlus Pharmacy – Old Town',
      licenseNumber: 'KA-BGL-2022-MP4401',
      ownerId: medplusOwner.id,
      address: 'No. 88, BB Road, Yelahanka Old Town',
      landmark: 'Opposite Yelahanka Police Station',
      lat: 13.1070,
      lng: 77.5985,
      phone: '+91 80 2846 1122',
      rating: 4.6,
      prepTimeMinutes: 15,
    },
    {
      name: 'Aster Pharmacy – Kogilu Cross',
      licenseNumber: 'KA-BGL-2024-AS1099',
      ownerId: owner3.id,
      address: 'Ground Floor, Aster Medcity Annex, Kogilu Cross, Yelahanka',
      landmark: 'Near Kogilu Signal',
      lat: 13.1150,
      lng: 77.6070,
      phone: '+91 80 2856 9900',
      rating: 4.9,
      prepTimeMinutes: 10,
    },
    {
      name: 'Trust Chemists & Druggists – 4th Phase',
      licenseNumber: 'KA-BGL-2021-TC3031',
      ownerId: owner4.id,
      address: 'Plot 12, 4th Phase, KHB Colony, Yelahanka New Town',
      landmark: 'Behind Mother Dairy circle',
      lat: 13.0950,
      lng: 77.5850,
      phone: '+91 80 2856 4500',
      rating: 4.5,
      prepTimeMinutes: 18,
    },
    {
      name: 'Guardian Pharmacy – Galleria Mall',
      licenseNumber: 'KA-BGL-2023-GP7721',
      ownerId: owner5.id,
      address: 'Lower Ground Floor, RMZ Galleria Mall, Ambedkar Colony, Yelahanka',
      landmark: 'RMZ Galleria Mall',
      lat: 13.1030,
      lng: 77.5890,
      phone: '+91 80 2846 8811',
      rating: 4.7,
      prepTimeMinutes: 14,
    },
    {
      name: 'Wellness Forever 24x7 – Judicial Layout',
      licenseNumber: 'KA-BGL-2023-WF9012',
      ownerId: owner6.id,
      address: 'Plot 55, Double Road, Judicial Layout, Allalasandra, Yelahanka',
      landmark: 'Near Allalasandra Lake',
      lat: 13.0880,
      lng: 77.5820,
      phone: '+91 80 2856 2424',
      rating: 4.6,
      prepTimeMinutes: 12,
    },
    {
      name: 'Sanjivani Medicals – Doddaballapur Road',
      licenseNumber: 'KA-BGL-2020-SJ5540',
      ownerId: owner7.id,
      address: 'No. 201, Doddaballapur Main Road, Maruthi Nagar, Yelahanka',
      landmark: 'Opposite BMS Institute of Technology',
      lat: 13.1120,
      lng: 77.5750,
      phone: '+91 80 2846 3399',
      rating: 4.4,
      prepTimeMinutes: 20,
    },
    {
      name: 'Pradhan Mantri Jan Aushadhi Kendra – Sector B',
      licenseNumber: 'KA-BGL-2022-JA0101',
      ownerId: owner8.id,
      address: 'Site 8, MIG Sector B, Yelahanka New Town',
      landmark: 'Near Mini Vidhana Soudha',
      lat: 13.0980,
      lng: 77.5920,
      phone: '+91 80 2856 1001',
      rating: 4.7,
      prepTimeMinutes: 15,
    },
  ];

  const createdPharmacies = [];
  for (const p of pharmaciesData) {
    const pharmacy = await prisma.pharmacy.create({ data: p });
    createdPharmacies.push(pharmacy);
  }

  const apollo = createdPharmacies[0];
  const medplus = createdPharmacies[1];
  const aster = createdPharmacies[2];

  // 3. Create ~60 Realistic Medicines across categories
  const medicinesCatalog = [
    // --- PRESCRIPTION (Rx) ---
    {
      name: 'Azithromycin 500mg',
      genericName: 'Azithromycin Dihydrate',
      brand: 'Azee 500 (Cipla)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '500mg',
      packSize: '5 Tablets per strip',
      manufacturer: 'Cipla Ltd.',
      description: 'Macrolide antibiotic used for respiratory tract, ear, skin, and throat infections.',
      sideEffects: 'Mild nausea, abdominal pain, diarrhea, headache.',
      requiresPrescription: true,
      image: '/images/medicines/azee.png',
    },
    {
      name: 'Augmentin 625 Duo Tablet',
      genericName: 'Amoxicillin + Potassium Clavulanate',
      brand: 'Augmentin (GSK)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '625mg (500mg + 125mg)',
      packSize: '10 Tablets per strip',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals',
      description: 'Penicillin-type antibiotic that fights bacteria in ears, nose, throat, chest, lungs, and urinary tract.',
      sideEffects: 'Loose stools, mild vomiting, skin rash.',
      requiresPrescription: true,
      image: '/images/medicines/augmentin.png',
    },
    {
      name: 'Glycomet 500 SR Tablet',
      genericName: 'Metformin Hydrochloride (Sustained Release)',
      brand: 'Glycomet (USV)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '500mg',
      packSize: '20 Tablets per strip',
      manufacturer: 'USV Pvt Ltd',
      description: 'First-line medication for the treatment of type 2 diabetes mellitus to regulate blood glucose.',
      sideEffects: 'Flatulence, stomach upset, metallic taste.',
      requiresPrescription: true,
      image: '/images/medicines/glycomet.png',
    },
    {
      name: 'Telma 40 Tablet',
      genericName: 'Telmisartan',
      brand: 'Telma (Glenmark)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '40mg',
      packSize: '15 Tablets per strip',
      manufacturer: 'Glenmark Pharmaceuticals',
      description: 'Angiotensin receptor blocker (ARB) used to treat hypertension (high blood pressure) and reduce stroke risk.',
      sideEffects: 'Dizziness, sinus congestion, back pain.',
      requiresPrescription: true,
      image: '/images/medicines/telma.png',
    },
    {
      name: 'Atorva 10 Tablet',
      genericName: 'Atorvastatin Calcium',
      brand: 'Atorva (Zydus)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '10mg',
      packSize: '15 Tablets per strip',
      manufacturer: 'Zydus Cadila',
      description: 'Statin lipid-lowering medication used to lower bad cholesterol (LDL) and triglycerides.',
      sideEffects: 'Joint ache, mild muscle soreness, indigestion.',
      requiresPrescription: true,
      image: '/images/medicines/atorva.png',
    },
    {
      name: 'Pan 40 Tablet',
      genericName: 'Pantoprazole Sodium Gastro-resistant',
      brand: 'Pan (Alkem)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '40mg',
      packSize: '15 Tablets per strip',
      manufacturer: 'Alkem Laboratories',
      description: 'Proton pump inhibitor (PPI) that decreases stomach acid production for GERD and acid reflux.',
      sideEffects: 'Dry mouth, headache, flatulence.',
      requiresPrescription: true,
      image: '/images/medicines/pan40.png',
    },
    {
      name: 'Montair-LC Tablet',
      genericName: 'Montelukast Sodium + Levocetirizine Dihydrochloride',
      brand: 'Montair-LC (Cipla)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '10mg + 5mg',
      packSize: '10 Tablets per strip',
      manufacturer: 'Cipla Ltd.',
      description: 'Dual-action antiallergic for allergic rhinitis, runny nose, sneezing, and mild asthma symptoms.',
      sideEffects: 'Drowsiness, dry throat, fatigue.',
      requiresPrescription: true,
      image: '/images/medicines/montair.png',
    },
    {
      name: 'Thyronorm 50mcg Tablet',
      genericName: 'Thyroxine Sodium',
      brand: 'Thyronorm (Abbott)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '50mcg',
      packSize: '120 Tablets per bottle',
      manufacturer: 'Abbott Healthcare',
      description: 'Synthetic thyroid hormone for hypothyroidism treatment.',
      sideEffects: 'Palpitations if over-dosed, nervousness.',
      requiresPrescription: true,
      image: '/images/medicines/thyronorm.png',
    },
    {
      name: 'Ciplox 500 Tablet',
      genericName: 'Ciprofloxacin Hydrochloride',
      brand: 'Ciplox (Cipla)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '500mg',
      packSize: '10 Tablets per strip',
      manufacturer: 'Cipla Ltd.',
      description: 'Fluoroquinolone antibiotic for bacterial infections of urinary tract, abdomen, and skin.',
      sideEffects: 'Nausea, dizziness, sun sensitivity.',
      requiresPrescription: true,
      image: '/images/medicines/ciplox.png',
    },
    {
      name: 'Ecosprin 75 Tablet',
      genericName: 'Aspirin (Acetylsalicylic Acid)',
      brand: 'Ecosprin (USV)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '75mg',
      packSize: '14 Tablets per strip',
      manufacturer: 'USV Pvt Ltd',
      description: 'Antiplatelet agent used for cardiovascular protection and prevention of blood clots.',
      sideEffects: 'Heartburn, mild bleeding tendency.',
      requiresPrescription: true,
      image: '/images/medicines/ecosprin.png',
    },
    {
      name: 'Budecort 200 Inhaler',
      genericName: 'Budesonide Inhalation Aerosol',
      brand: 'Budecort (Cipla)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Inhaler',
      strength: '200mcg',
      packSize: '200 Metered Doses',
      manufacturer: 'Cipla Ltd.',
      description: 'Corticosteroid inhaler for maintenance treatment of asthma and chronic bronchospasm.',
      sideEffects: 'Hoarse voice, oral thrush (rinse mouth after use).',
      requiresPrescription: true,
      image: '/images/medicines/budecort.png',
    },
    {
      name: 'Asthalin 100mcg Inhaler',
      genericName: 'Salbutamol (Albuterol)',
      brand: 'Asthalin (Cipla)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Inhaler',
      strength: '100mcg',
      packSize: '200 Metered Doses',
      manufacturer: 'Cipla Ltd.',
      description: 'Fast-acting bronchodilator for rapid relief of asthma attacks and sudden wheezing.',
      sideEffects: 'Mild tremors, elevated heart rate.',
      requiresPrescription: true,
      image: '/images/medicines/asthalin.png',
    },
    {
      name: 'Omnacortil 20 Tablet',
      genericName: 'Prednisolone Disodium Phosphate',
      brand: 'Omnacortil (Macleods)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '20mg',
      packSize: '10 Tablets per strip',
      manufacturer: 'Macleods Pharmaceuticals',
      description: 'Steroid medication for severe allergic reactions, arthritis, and autoimmune flare-ups.',
      sideEffects: 'Fluid retention, increased appetite, insomnia.',
      requiresPrescription: true,
      image: '/images/medicines/omnacortil.png',
    },
    {
      name: 'Zoryl M 2 Forte Tablet',
      genericName: 'Glimepiride + Metformin SR',
      brand: 'Zoryl (Intas)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '2mg + 1000mg',
      packSize: '15 Tablets per strip',
      manufacturer: 'Intas Pharmaceuticals',
      description: 'Combination antidiabetic drug for elevated HbA1c control.',
      sideEffects: 'Risk of hypoglycemia, digestive discomfort.',
      requiresPrescription: true,
      image: '/images/medicines/zoryl.png',
    },
    {
      name: 'Crestor 10mg Tablet',
      genericName: 'Rosuvastatin Calcium',
      brand: 'Crestor (AstraZeneca)',
      category: MedicineCategory.PRESCRIPTION,
      dosageForm: 'Tablet',
      strength: '10mg',
      packSize: '15 Tablets per strip',
      manufacturer: 'AstraZeneca India',
      description: 'Potent statin for hyperlipidemia and cardiovascular risk mitigation.',
      sideEffects: 'Muscle ache, elevated liver enzymes.',
      requiresPrescription: true,
      image: '/images/medicines/crestor.png',
    },

    // --- OTC MEDICINES ---
    {
      name: 'Dolo 650 Tablet',
      genericName: 'Paracetamol (Acetaminophen)',
      brand: 'Dolo (Micro Labs)',
      category: MedicineCategory.OTC,
      dosageForm: 'Tablet',
      strength: '650mg',
      packSize: '15 Tablets per strip',
      manufacturer: 'Micro Labs Ltd',
      description: 'India’s most trusted antipyretic and analgesic for fever, body ache, and mild headache.',
      sideEffects: 'Rare allergic reactions. Do not exceed 4g daily.',
      requiresPrescription: false,
      image: '/images/medicines/dolo.png',
    },
    {
      name: 'Crocin Advance 500mg Tablet',
      genericName: 'Paracetamol with Fast Release Technology',
      brand: 'Crocin (GSK)',
      category: MedicineCategory.OTC,
      dosageForm: 'Tablet',
      strength: '500mg',
      packSize: '20 Tablets per strip',
      manufacturer: 'GlaxoSmithKline Asia',
      description: 'Fast-absorbing paracetamol formulation for fast relief from headache and fever.',
      sideEffects: 'Safe when taken as directed.',
      requiresPrescription: false,
      image: '/images/medicines/crocin.png',
    },
    {
      name: 'Combiflam Tablet',
      genericName: 'Ibuprofen + Paracetamol',
      brand: 'Combiflam (Sanofi)',
      category: MedicineCategory.OTC,
      dosageForm: 'Tablet',
      strength: '400mg + 325mg',
      packSize: '20 Tablets per strip',
      manufacturer: 'Sanofi India Ltd',
      description: 'Dual anti-inflammatory and painkiller for toothache, backache, and muscular sprains.',
      sideEffects: 'Stomach irritation. Take after food.',
      requiresPrescription: false,
      image: '/images/medicines/combiflam.png',
    },
    {
      name: 'Digene Antacid Gel Mint',
      genericName: 'Magnesium Hydroxide + Aluminium Hydroxide + Simethicone',
      brand: 'Digene (Abbott)',
      category: MedicineCategory.OTC,
      dosageForm: 'Syrup / Suspension',
      strength: 'Liquid Gel',
      packSize: '200ml Bottle',
      manufacturer: 'Abbott Healthcare',
      description: 'Quick cooling relief from acidity, heartburn, gas, and stomach heaviness.',
      sideEffects: 'Occasional mild laxative effect.',
      requiresPrescription: false,
      image: '/images/medicines/digene.png',
    },
    {
      name: 'Gelusil MPS Antacid Tablets',
      genericName: 'Dimethicone + Aluminium + Magnesium Hydroxide',
      brand: 'Gelusil (Pfizer)',
      category: MedicineCategory.OTC,
      dosageForm: 'Chewable Tablet',
      strength: 'Standard MPS',
      packSize: '15 Chewable Tablets',
      manufacturer: 'Pfizer Ltd',
      description: 'Sugar-free chewable antacid for instant relief from burning sensation in chest.',
      sideEffects: 'Chalky taste.',
      requiresPrescription: false,
      image: '/images/medicines/gelusil.png',
    },
    {
      name: 'Vicks VapoRub Balm',
      genericName: 'Camphor + Menthol + Eucalyptus Oil',
      brand: 'Vicks (P&G)',
      category: MedicineCategory.OTC,
      dosageForm: 'Balm / Ointment',
      strength: '50g Jar',
      packSize: '50g Jar',
      manufacturer: 'Procter & Gamble Hygiene',
      description: 'Topical vaporizing balm for cold relief, nasal decongestion, and chest comfort.',
      sideEffects: 'Skin irritation in rare sensitive skin.',
      requiresPrescription: false,
      image: '/images/medicines/vicks.png',
    },
    {
      name: 'Strepsils Honey & Lemon Lozenges',
      genericName: 'Dichlorobenzyl Alcohol + Amylmetacresol',
      brand: 'Strepsils (Reckitt)',
      category: MedicineCategory.OTC,
      dosageForm: 'Lozenge',
      strength: 'Standard',
      packSize: '8 Lozenges per pack',
      manufacturer: 'Reckitt Benckiser',
      description: 'Soothing antiseptic throat lozenges for scratchy and painful sore throat.',
      sideEffects: 'None reported.',
      requiresPrescription: false,
      image: '/images/medicines/strepsils.png',
    },
    {
      name: 'Electral ORS Sachet 21.8g',
      genericName: 'Oral Rehydration Salts (WHO Formula)',
      brand: 'Electral (FDC)',
      category: MedicineCategory.OTC,
      dosageForm: 'Powder Sachet',
      strength: '21.8g (for 1 Litre water)',
      packSize: 'Single Sachet',
      manufacturer: 'FDC Ltd',
      description: 'Restores essential electrolytes and fluids lost during diarrhea, vomiting, or dehydration.',
      sideEffects: 'Safe for all age groups.',
      requiresPrescription: false,
      image: '/images/medicines/electral.png',
    },
    {
      name: 'Cetriz 10mg Tablet',
      genericName: 'Cetirizine Hydrochloride',
      brand: 'Cetriz (Alkem)',
      category: MedicineCategory.OTC,
      dosageForm: 'Tablet',
      strength: '10mg',
      packSize: '10 Tablets per strip',
      manufacturer: 'Alkem Laboratories',
      description: 'Non-sedating antihistamine for sneezing, watery eyes, urticaria, and hay fever.',
      sideEffects: 'Mild drowsiness in some users.',
      requiresPrescription: false,
      image: '/images/medicines/cetriz.png',
    },
    {
      name: 'Otrivin Oxy Fast Relief Nasal Spray',
      genericName: 'Oxymetazoline Hydrochloride 0.05%',
      brand: 'Otrivin (GSK)',
      category: MedicineCategory.OTC,
      dosageForm: 'Nasal Spray',
      strength: '0.05% w/v',
      packSize: '10ml Spray Bottle',
      manufacturer: 'GlaxoSmithKline',
      description: 'Acts in 25 seconds to unblock congested nasal passages for up to 12 hours.',
      sideEffects: 'Rebound congestion if used longer than 5 consecutive days.',
      requiresPrescription: false,
      image: '/images/medicines/otrivin.png',
    },
    {
      name: 'Benadryl Cough Syrup (DR)',
      genericName: 'Dextromethorphan HBr',
      brand: 'Benadryl (Johnson & Johnson)',
      category: MedicineCategory.OTC,
      dosageForm: 'Syrup',
      strength: '100ml',
      packSize: '100ml Bottle',
      manufacturer: 'J&J Consumer Health',
      description: 'Dry cough formula for rapid throat irritation suppression.',
      sideEffects: 'Slight sleepiness.',
      requiresPrescription: false,
      image: '/images/medicines/benadryl.png',
    },
    {
      name: 'Eno Fruit Salt Lemon Flavour',
      genericName: 'Svarjiksara + Nimbukamlam',
      brand: 'Eno (GSK)',
      category: MedicineCategory.OTC,
      dosageForm: 'Effervescent Powder',
      strength: '5g Sachet',
      packSize: '5g Sachet (Box of 6)',
      manufacturer: 'GSK Consumer',
      description: 'Fast effervescent action relieves acidity in 6 seconds.',
      sideEffects: 'None for occasional use.',
      requiresPrescription: false,
      image: '/images/medicines/eno.png',
    },
    {
      name: 'Saridon Headache Relief Tablet',
      genericName: 'Paracetamol + Propyphenazone + Caffeine',
      brand: 'Saridon (Piramal)',
      category: MedicineCategory.OTC,
      dosageForm: 'Tablet',
      strength: 'Triple Action',
      packSize: '10 Tablets per strip',
      manufacturer: 'Piramal Pharma Ltd',
      description: 'Triple-active fast relief for persistent tension headaches.',
      sideEffects: 'Caffeine restlessness if taken late evening.',
      requiresPrescription: false,
      image: '/images/medicines/saridon.png',
    },
    {
      name: 'Moov Pain Relief Spray',
      genericName: 'Diclofenac + Menthol + Methyl Salicylate',
      brand: 'Moov (Reckitt)',
      category: MedicineCategory.OTC,
      dosageForm: 'Spray',
      strength: '50g Spray Can',
      packSize: '50g Spray Can',
      manufacturer: 'Reckitt Benckiser',
      description: 'Fast penetrating aerosol spray for acute backaches and joint stiffness.',
      sideEffects: 'Tingling warmth.',
      requiresPrescription: false,
      image: '/images/medicines/moov.png',
    },
    {
      name: 'Hajmola Regular Digestive Tablets',
      genericName: 'Ayurvedic Herbal Digestive Mix',
      brand: 'Hajmola (Dabur)',
      category: MedicineCategory.OTC,
      dosageForm: 'Chewable Tablet',
      strength: 'Herbal Formula',
      packSize: '120 Tablets Bottle',
      manufacturer: 'Dabur India Ltd',
      description: 'Traditional herbal digestive stimulant for post-meal lightness.',
      sideEffects: 'None.',
      requiresPrescription: false,
      image: '/images/medicines/hajmola.png',
    },

    // --- VITAMINS & SUPPLEMENTS ---
    {
      name: 'Becosules Z Capsule',
      genericName: 'Vitamin B-Complex with Vitamin C and Zinc',
      brand: 'Becosules (Pfizer)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Capsule',
      strength: 'Multivitamin + Zinc',
      packSize: '20 Capsules per strip',
      manufacturer: 'Pfizer Ltd',
      description: 'Immunity booster, supports mouth ulcer healing, skin radiance, and energy metabolism.',
      sideEffects: 'Bright yellow urine (harmless Vitamin B2 excretion).',
      requiresPrescription: false,
      image: '/images/medicines/becosules.png',
    },
    {
      name: 'Shelcal 500 Tablet',
      genericName: 'Calcium 500mg + Vitamin D3 250 IU',
      brand: 'Shelcal (Torrent)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Tablet',
      strength: '500mg Calcium',
      packSize: '15 Tablets per strip',
      manufacturer: 'Torrent Pharmaceuticals',
      description: 'Essential calcium supplement for bone density, osteoporosis prevention, and joint support.',
      sideEffects: 'Mild constipation if water intake is low.',
      requiresPrescription: false,
      image: '/images/medicines/shelcal.png',
    },
    {
      name: 'Neurobion Forte Tablet',
      genericName: 'Vitamin B1 + B6 + B12 (Cyanocobalamin)',
      brand: 'Neurobion (Procter & Gamble Health)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Tablet',
      strength: 'High Potency B-Vitamins',
      packSize: '30 Tablets per strip',
      manufacturer: 'P&G Health Ltd',
      description: 'Nerve health supplement for tingling, numbness in fingers/toes, and diabetic neuropathy.',
      sideEffects: 'Generally very well tolerated.',
      requiresPrescription: false,
      image: '/images/medicines/neurobion.png',
    },
    {
      name: 'Zincovit Tablet',
      genericName: 'Multivitamins + Multiminerals with Grape Seed Extract',
      brand: 'Zincovit (Apex)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Tablet',
      strength: 'Comprehensive Formula',
      packSize: '15 Tablets per strip',
      manufacturer: 'Apex Laboratories',
      description: 'Daily nutritional booster for recovery from viral fatigue and antioxidant defence.',
      sideEffects: 'Take with meal to avoid mild nausea.',
      requiresPrescription: false,
      image: '/images/medicines/zincovit.png',
    },
    {
      name: 'Limcee 500mg Chewable Tablet',
      genericName: 'Ascorbic Acid (Vitamin C)',
      brand: 'Limcee (Abbott)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Chewable Tablet',
      strength: '500mg (Orange Flavour)',
      packSize: '15 Tablets per strip',
      manufacturer: 'Abbott Healthcare',
      description: 'Daily chewable vitamin C for cellular collagen synthesis and cold prevention.',
      sideEffects: 'None.',
      requiresPrescription: false,
      image: '/images/medicines/limcee.png',
    },
    {
      name: 'Evion 400 Capsule',
      genericName: 'Tocopheryl Acetate (Vitamin E)',
      brand: 'Evion (Merck / P&G Health)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Softgel Capsule',
      strength: '400mg',
      packSize: '10 Capsules per strip',
      manufacturer: 'P&G Health Ltd',
      description: 'Antioxidant vitamin E softgel for skin repair, hair health, and leg muscle cramps.',
      sideEffects: 'Safe within daily recommended allowance.',
      requiresPrescription: false,
      image: '/images/medicines/evion.png',
    },
    {
      name: 'Revital H Men Capsule',
      genericName: 'Ginseng with Multivitamins & Minerals',
      brand: 'Revital (Sun Pharma)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Capsule',
      strength: 'Daily Energy Formula',
      packSize: '30 Capsules Bottle',
      manufacturer: 'Sun Pharmaceutical Industries',
      description: 'Daily physical endurance and mental alertness booster containing authentic Korean Ginseng.',
      sideEffects: 'Mild jitteriness if taken with excess coffee.',
      requiresPrescription: false,
      image: '/images/medicines/revital.png',
    },
    {
      name: 'Calpol T 60k Vitamin D3 Drops',
      genericName: 'Cholecalciferol 60,000 IU',
      brand: 'D-Rise (USV)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Capsule',
      strength: '60,000 IU',
      packSize: '4 Softgels per strip',
      manufacturer: 'USV Pvt Ltd',
      description: 'High-strength weekly booster for clinical vitamin D deficiency.',
      sideEffects: 'Take strictly once a week as prescribed.',
      requiresPrescription: false,
      image: '/images/medicines/drise.png',
    },
    {
      name: 'Supradyn Daily Multivitamin',
      genericName: 'Minerals + Trace Elements + Amino Acids',
      brand: 'Supradyn (Bayer)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Tablet',
      strength: 'Active Daily Formula',
      packSize: '15 Tablets per strip',
      manufacturer: 'Bayer Pharmaceuticals',
      description: 'Formulated to combat lifestyle tiredness and maintain peak vitality.',
      sideEffects: 'None.',
      requiresPrescription: false,
      image: '/images/medicines/supradyn.png',
    },
    {
      name: 'Seven Seas Cod Liver Oil Softgels',
      genericName: 'Omega-3 Fatty Acids + Vitamin A & D',
      brand: 'Seven Seas (P&G Health)',
      category: MedicineCategory.VITAMINS,
      dosageForm: 'Softgel Capsule',
      strength: 'Pure Icelandic Cod Oil',
      packSize: '100 Capsules Bottle',
      manufacturer: 'Seven Seas Ltd',
      description: 'Supports heart health, eye function, and flexible joint mobility.',
      sideEffects: 'Mild fishy burp if taken on empty stomach.',
      requiresPrescription: false,
      image: '/images/medicines/sevenseas.png',
    },

    // --- PERSONAL CARE & FIRST AID ---
    {
      name: 'Dettol Antiseptic Liquid 250ml',
      genericName: 'Chloroxylenol (PCMX) 4.8% w/v',
      brand: 'Dettol (Reckitt)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Liquid Disinfectant',
      strength: '250ml Bottle',
      packSize: '250ml Bottle',
      manufacturer: 'Reckitt Benckiser',
      description: 'Hospital-grade antiseptic liquid for first aid wound cleansing, cuts, bites, and hygiene.',
      sideEffects: 'Dilute before applying to skin.',
      requiresPrescription: false,
      image: '/images/medicines/dettol.png',
    },
    {
      name: 'Savlon Antiseptic Liquid 200ml',
      genericName: 'Chlorhexidine Gluconate + Cetrimide',
      brand: 'Savlon (ITC)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Liquid Antiseptic',
      strength: '200ml Bottle',
      packSize: '200ml Bottle',
      manufacturer: 'ITC Ltd',
      description: 'Gentle, non-stinging antiseptic solution that cleans scrapes without a burning sensation.',
      sideEffects: 'Safe for delicate skin.',
      requiresPrescription: false,
      image: '/images/medicines/savlon.png',
    },
    {
      name: 'Betadine 10% Ointment 20g',
      genericName: 'Povidone Iodine 10% w/w',
      brand: 'Betadine (Win-Medicare)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Ointment / Cream',
      strength: '10% w/w',
      packSize: '20g Tube',
      manufacturer: 'Win-Medicare Pvt Ltd',
      description: 'Broad-spectrum microbicidal ointment for minor burns, lacerations, and surgical wounds.',
      sideEffects: 'Brown skin staining (washes off with soap).',
      requiresPrescription: false,
      image: '/images/medicines/betadine.png',
    },
    {
      name: 'Volini Pain Relief Gel 30g',
      genericName: 'Diclofenac Diethylamine + Linseed Oil + Methyl Salicylate',
      brand: 'Volini (Sun Pharma)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Gel',
      strength: '30g Tube',
      packSize: '30g Tube',
      manufacturer: 'Sun Pharmaceutical',
      description: 'Deep penetrating pain relief gel for sprains, sports injuries, and neck stiffness.',
      sideEffects: 'Wash hands after application.',
      requiresPrescription: false,
      image: '/images/medicines/volini.png',
    },
    {
      name: 'Soframycin Skin Cream 30g',
      genericName: 'Framycetin Sulphate 1%',
      brand: 'Soframycin (Sanofi)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Cream',
      strength: '1% w/w',
      packSize: '30g Tube',
      manufacturer: 'Sanofi India Ltd',
      description: 'Antibacterial topical cream for infected cuts, scalds, ulcers, and impetigo.',
      sideEffects: 'Local sensitization in rare cases.',
      requiresPrescription: false,
      image: '/images/medicines/soframycin.png',
    },
    {
      name: 'Hansaplast Regular Bandages (Pack of 20)',
      genericName: 'Medicated Wound Dressing Strip',
      brand: 'Hansaplast (Beiersdorf)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Bandage Strip',
      strength: 'Antiseptic Cushion Pad',
      packSize: 'Pack of 20 Strips',
      manufacturer: 'Beiersdorf India',
      description: 'Breathable, flexible adhesive plaster that keeps dirt and bacteria out of fresh cuts.',
      sideEffects: 'None.',
      requiresPrescription: false,
      image: '/images/medicines/hansaplast.png',
    },
    {
      name: 'Boroline Antiseptic Ayurvedic Cream 20g',
      genericName: 'Boric Acid + Zinc Oxide + Anhydrous Lanolin',
      brand: 'Boroline (GD Pharmaceuticals)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Cream',
      strength: '20g Tube',
      packSize: '20g Tube',
      manufacturer: 'G.D. Pharmaceuticals',
      description: 'Heritage healing cream for dry cracked heels, chapped lips, and rough elbows.',
      sideEffects: 'Very thick emollients.',
      requiresPrescription: false,
      image: '/images/medicines/boroline.png',
    },
    {
      name: 'Himalaya Purifying Neem Face Wash 100ml',
      genericName: 'Neem + Turmeric Extract',
      brand: 'Himalaya Wellness',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Gel Wash',
      strength: '100ml Bottle',
      packSize: '100ml Tube',
      manufacturer: 'The Himalaya Drug Company',
      description: 'Herbal cleanser that prevents pimples and controls excess oil without over-drying.',
      sideEffects: 'None.',
      requiresPrescription: false,
      image: '/images/medicines/himalaya_neem.png',
    },
    {
      name: 'Accu-Chek Active Test Strips (Pack of 50)',
      genericName: 'Blood Glucose Test Strips',
      brand: 'Accu-Chek (Roche)',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Diagnostic Strips',
      strength: '50 Test Strips',
      packSize: 'Vial of 50 Strips',
      manufacturer: 'Roche Diabetes Care',
      description: 'Fast, accurate blood sugar self-testing strips for Accu-Chek Active glucometer.',
      sideEffects: 'Store tightly closed away from moisture.',
      requiresPrescription: false,
      image: '/images/medicines/accuchek.png',
    },
    {
      name: 'Dr. Morepen Digital Thermometer',
      genericName: 'Digital Clinical Thermometer',
      brand: 'Dr. Morepen',
      category: MedicineCategory.PERSONAL_CARE,
      dosageForm: 'Medical Device',
      strength: '1 Unit with Beeper',
      packSize: '1 Piece',
      manufacturer: 'Morepen Laboratories Ltd',
      description: 'Precise 60-second fever reading with fever alarm, auto shut-off, and waterproof tip.',
      sideEffects: 'Battery operated.',
      requiresPrescription: false,
      image: '/images/medicines/thermometer.png',
    },
  ];

  const createdMedicines = [];
  for (const m of medicinesCatalog) {
    const med = await prisma.medicine.create({ data: m });
    createdMedicines.push(med);
  }

  console.log(`✅ Created ${createdPharmacies.length} pharmacies and ${createdMedicines.length} medicines.`);

  // 4. Create Realistic Inventory Batches for all pharmacies
  // We'll vary quantities and expiry dates:
  // - Plenty in stock (unexpired)
  // - Expiring in 20 days (triggers <30 days alert)
  // - Expiring in 50 days (triggers <60 days alert)
  // - Expiring in 80 days (triggers <90 days alert)
  // - Expired 15 days ago (triggers auto-flagged expired)
  // - Critical fallback scenario: Azithromycin 500mg has 0 stock at Apollo, but 25 in stock at MedPlus and 18 at Aster!

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const basePrices: Record<string, { mrp: number; sale: number }> = {
    'Azithromycin 500mg': { mrp: 135, sale: 119 },
    'Augmentin 625 Duo Tablet': { mrp: 210, sale: 185 },
    'Glycomet 500 SR Tablet': { mrp: 48, sale: 41 },
    'Telma 40 Tablet': { mrp: 110, sale: 95 },
    'Atorva 10 Tablet': { mrp: 95, sale: 82 },
    'Pan 40 Tablet': { mrp: 155, sale: 134 },
    'Montair-LC Tablet': { mrp: 180, sale: 158 },
    'Thyronorm 50mcg Tablet': { mrp: 175, sale: 152 },
    'Ciplox 500 Tablet': { mrp: 45, sale: 38 },
    'Ecosprin 75 Tablet': { mrp: 20, sale: 16 },
    'Budecort 200 Inhaler': { mrp: 420, sale: 380 },
    'Asthalin 100mcg Inhaler': { mrp: 165, sale: 145 },
    'Omnacortil 20 Tablet': { mrp: 40, sale: 33 },
    'Zoryl M 2 Forte Tablet': { mrp: 225, sale: 198 },
    'Crestor 10mg Tablet': { mrp: 310, sale: 275 },
    'Dolo 650 Tablet': { mrp: 34, sale: 30 },
    'Crocin Advance 500mg Tablet': { mrp: 30, sale: 26 },
    'Combiflam Tablet': { mrp: 45, sale: 39 },
    'Digene Antacid Gel Mint': { mrp: 145, sale: 125 },
    'Gelusil MPS Antacid Tablets': { mrp: 22, sale: 19 },
    'Vicks VapoRub Balm': { mrp: 90, sale: 82 },
    'Strepsils Honey & Lemon Lozenges': { mrp: 35, sale: 32 },
    'Electral ORS Sachet 21.8g': { mrp: 23, sale: 21 },
    'Cetriz 10mg Tablet': { mrp: 28, sale: 24 },
    'Otrivin Oxy Fast Relief Nasal Spray': { mrp: 115, sale: 102 },
    'Benadryl Cough Syrup (DR)': { mrp: 130, sale: 115 },
    'Eno Fruit Salt Lemon Flavour': { mrp: 55, sale: 50 },
    'Saridon Headache Relief Tablet': { mrp: 42, sale: 38 },
    'Moov Pain Relief Spray': { mrp: 160, sale: 142 },
    'Hajmola Regular Digestive Tablets': { mrp: 65, sale: 58 },
    'Becosules Z Capsule': { mrp: 48, sale: 42 },
    'Shelcal 500 Tablet': { mrp: 130, sale: 112 },
    'Neurobion Forte Tablet': { mrp: 40, sale: 34 },
    'Zincovit Tablet': { mrp: 115, sale: 99 },
    'Limcee 500mg Chewable Tablet': { mrp: 25, sale: 21 },
    'Evion 400 Capsule': { mrp: 38, sale: 33 },
    'Revital H Men Capsule': { mrp: 330, sale: 290 },
    'Calpol T 60k Vitamin D3 Drops': { mrp: 185, sale: 160 },
    'Supradyn Daily Multivitamin': { mrp: 60, sale: 52 },
    'Seven Seas Cod Liver Oil Softgels': { mrp: 340, sale: 299 },
    'Dettol Antiseptic Liquid 250ml': { mrp: 135, sale: 122 },
    'Savlon Antiseptic Liquid 200ml': { mrp: 95, sale: 84 },
    'Betadine 10% Ointment 20g': { mrp: 125, sale: 110 },
    'Volini Pain Relief Gel 30g': { mrp: 145, sale: 128 },
    'Soframycin Skin Cream 30g': { mrp: 68, sale: 59 },
    'Hansaplast Regular Bandages (Pack of 20)': { mrp: 50, sale: 45 },
    'Boroline Antiseptic Ayurvedic Cream 20g': { mrp: 42, sale: 38 },
    'Himalaya Purifying Neem Face Wash 100ml': { mrp: 150, sale: 132 },
    'Accu-Chek Active Test Strips (Pack of 50)': { mrp: 975, sale: 850 },
    'Dr. Morepen Digital Thermometer': { mrp: 220, sale: 185 },
  };

  let batchCount = 0;
  for (const pharmacy of createdPharmacies) {
    for (const med of createdMedicines) {
      const priceConfig = basePrices[med.name] || { mrp: 100, sale: 89 };

      // Critical scenario for Demo:
      // If pharmacy is Apollo and medicine is 'Azithromycin 500mg', set quantity to 0 (Out of stock trigger)
      let quantity = Math.floor(Math.random() * 40) + 10;
      if (pharmacy.id === apollo.id && med.name === 'Azithromycin 500mg') {
        quantity = 0; // Trigger A demonstration!
      }

      // Add normal healthy batch expiring in 18 months
      await prisma.inventoryBatch.create({
        data: {
          pharmacyId: pharmacy.id,
          medicineId: med.id,
          batchNumber: `BT-${pharmacy.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          quantity,
          mfgDate: new Date(now.getTime() - 90 * dayMs),
          expiryDate: new Date(now.getTime() + 540 * dayMs),
          mrp: priceConfig.mrp,
          salePrice: priceConfig.sale,
          isFlaggedExpired: false,
        },
      });
      batchCount++;

      // Create deliberate batches for Expiry Monitoring Dashboard (Objective 7)
      if (pharmacy.id === apollo.id) {
        if (med.name === 'Dolo 650 Tablet') {
          // Expiring in 22 days (< 30 days alert!)
          await prisma.inventoryBatch.create({
            data: {
              pharmacyId: pharmacy.id,
              medicineId: med.id,
              batchNumber: 'BT-APL-EXP30',
              quantity: 18,
              mfgDate: new Date(now.getTime() - 340 * dayMs),
              expiryDate: new Date(now.getTime() + 22 * dayMs),
              mrp: priceConfig.mrp,
              salePrice: priceConfig.sale * 0.8, // clearance discount
              isFlaggedExpired: false,
            },
          });
          batchCount++;
        }

        if (med.name === 'Combiflam Tablet') {
          // Expiring in 45 days (< 60 days alert!)
          await prisma.inventoryBatch.create({
            data: {
              pharmacyId: pharmacy.id,
              medicineId: med.id,
              batchNumber: 'BT-APL-EXP60',
              quantity: 25,
              mfgDate: new Date(now.getTime() - 320 * dayMs),
              expiryDate: new Date(now.getTime() + 45 * dayMs),
              mrp: priceConfig.mrp,
              salePrice: priceConfig.sale * 0.85,
              isFlaggedExpired: false,
            },
          });
          batchCount++;
        }

        if (med.name === 'Augmentin 625 Duo Tablet') {
          // Expired 10 days ago (auto-flagged expired)
          await prisma.inventoryBatch.create({
            data: {
              pharmacyId: pharmacy.id,
              medicineId: med.id,
              batchNumber: 'BT-APL-EXPIRED',
              quantity: 12,
              mfgDate: new Date(now.getTime() - 380 * dayMs),
              expiryDate: new Date(now.getTime() - 10 * dayMs),
              mrp: priceConfig.mrp,
              salePrice: priceConfig.sale,
              isFlaggedExpired: true,
            },
          });
          batchCount++;
        }
      }
    }
  }

  console.log(`✅ Created ${batchCount} inventory batches with varying expiry cycles.`);

  // 5. Pre-create Demo Scenario: Live Delayed Order for Trigger B Demonstration
  // Customer placed an order at Apollo Pharmacy 40 minutes ago.
  // Promised ETA was 20 minutes ago. It's still in PREPARING status.
  const doloMed = createdMedicines.find((m) => m.name === 'Dolo 650 Tablet')!;
  const electralMed = createdMedicines.find((m) => m.name === 'Electral ORS Sachet 21.8g')!;
  const doloBatch = await prisma.inventoryBatch.findFirst({
    where: { pharmacyId: apollo.id, medicineId: doloMed.id, quantity: { gt: 0 } },
  });
  const electralBatch = await prisma.inventoryBatch.findFirst({
    where: { pharmacyId: apollo.id, medicineId: electralMed.id, quantity: { gt: 0 } },
  });

  const delayedOrder = await prisma.order.create({
    data: {
      orderNumber: 'MR-YEL-2026-9041',
      customerId: customer.id,
      pharmacyId: apollo.id,
      totalAmount: 142,
      discountAmount: 10,
      deliveryFee: 30,
      netAmount: 162,
      deliveryAddress: 'Flat 402, Prestige Shantiniketan, Sector A, Yelahanka New Town, Bengaluru (560064)',
      customerPhone: '+91 98450 12345',
      customerLat: 13.1000,
      customerLng: 77.5950,
      status: OrderStatus.PREPARING,
      placedAt: new Date(now.getTime() - 40 * 60 * 1000), // placed 40 mins ago
      promisedEta: new Date(now.getTime() - 15 * 60 * 1000), // ETA was 15 mins ago (DELAYED!)
      isDelayed: true,
      fallbackOffered: true,
      items: {
        create: [
          {
            medicineId: doloMed.id,
            batchId: doloBatch?.id,
            quantity: 2,
            unitPrice: 30,
            subtotal: 60,
          },
          {
            medicineId: electralMed.id,
            batchId: electralBatch?.id,
            quantity: 3,
            unitPrice: 21,
            subtotal: 63,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: OrderStatus.PLACED,
            notes: 'Order confirmed and paid via UPI',
            timestamp: new Date(now.getTime() - 40 * 60 * 1000),
          },
          {
            status: OrderStatus.ACCEPTED,
            notes: 'Apollo Pharmacy accepted order',
            timestamp: new Date(now.getTime() - 35 * 60 * 1000),
          },
          {
            status: OrderStatus.PREPARING,
            notes: 'Pharmacist is packaging order. Delayed due to high store rush.',
            timestamp: new Date(now.getTime() - 25 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Assign delivery partner
  await prisma.deliveryAssignment.create({
    data: {
      orderId: delayedOrder.id,
      partnerId: deliveryPartner.id,
      status: DeliveryStatus.ASSIGNED,
    },
  });

  // Create demo pending prescription for verification workflow (Objective 4)
  const rxOrder = await prisma.order.create({
    data: {
      orderNumber: 'MR-YEL-2026-8802',
      customerId: customer.id,
      pharmacyId: apollo.id,
      totalAmount: 370,
      discountAmount: 20,
      deliveryFee: 30,
      netAmount: 380,
      deliveryAddress: 'Flat 402, Prestige Shantiniketan, Sector A, Yelahanka New Town, Bengaluru',
      customerPhone: '+91 98450 12345',
      status: OrderStatus.PLACED,
      placedAt: new Date(now.getTime() - 10 * 60 * 1000),
      promisedEta: new Date(now.getTime() + 35 * 60 * 1000),
      items: {
        create: [
          {
            medicineId: createdMedicines.find((m) => m.name === 'Augmentin 625 Duo Tablet')!.id,
            quantity: 2,
            unitPrice: 185,
            subtotal: 370,
          },
        ],
      },
      statusHistory: {
        create: {
          status: OrderStatus.PLACED,
          notes: 'Awaiting pharmacist prescription verification',
        },
      },
    },
  });

  await prisma.prescription.create({
    data: {
      customerId: customer.id,
      orderId: rxOrder.id,
      fileUrl: '/uploads/sample_prescription.jpg',
      fileName: 'Dr_Anand_Rx_Nov2026.jpg',
      fileType: 'image/jpeg',
      status: PrescriptionStatus.PENDING,
      uploadedAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  });

  // In-app Notification for Fallback
  await prisma.notification.create({
    data: {
      userId: customer.id,
      title: 'Order Delay Notice – Alternatives Available',
      message: 'Your order #MR-YEL-2026-9041 at Apollo Pharmacy is delayed by 15 mins. Nearby MedPlus and Aster have your medicines in stock.',
      type: 'FALLBACK',
      link: `/orders/${delayedOrder.id}`,
    },
  });

  console.log('🎉 Seed complete! Demo accounts ready.');
  console.log('----------------------------------------------------');
  console.log('Customer:        customer@medireach.in   / Password123!');
  console.log('Apollo Owner:    apollo@medireach.in     / Password123!');
  console.log('MedPlus Owner:   medplus@medireach.in    / Password123!');
  console.log('Delivery Partner:delivery@medireach.in   / Password123!');
  console.log('Admin:           admin@medireach.in      / Password123!');
  console.log('Delayed Order ID:', delayedOrder.id);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

