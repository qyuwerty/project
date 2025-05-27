const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const router = express.Router();
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

//for image
app.use('/images', express.static('public'));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/BonbononDatabase')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

//route for qr code generation
router.post('/generate', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(url)}`;
  return res.json({ qrCodeUrl });
});

module.exports = router;

// Define Resident Schema
const residentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstname: String,
  lastname: String,
  birthday: Date,
  gender: String,
  age: Number,
  address: String,
  email: String,
  phoneNumber: String,
  civilStatus: String,
  religion: String,
  houseNumber: String,
  purok: String,
  yearsOfResidency: Number,
  employmentStatus: String,
  occupation: String,
  monthlyIncomeRange: String,
  educationLevel: String
});

const Resident = mongoose.model('Resident', residentSchema);

// Define Medical Record Schema
const medicalRecordSchema = new mongoose.Schema({
  residentId: { type: String, required: true, unique: true, ref: 'Resident' },
  healthConditions: String,
  bloodType: String,
  vaccinationStatus: String,
  insuranceStatus: String,
  notes: String
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

// Define QR Code Schema
const qrCodeSchema = new mongoose.Schema({
  data: { type: String, required: true }, // The data encoded in the QR code
  createdAt: { type: Date, default: Date.now } // Timestamp for when the QR code was created
});

const QRCodeModel = mongoose.model('QRCode', qrCodeSchema);

// Generate QR Code
app.post('/generate-qr', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ message: 'Data is required to generate a QR code' });
  }

  try {
    const qrCodeImage = await QRCode.toDataURL(data);
    const newQRCode = new QRCodeModel({ data });
    await newQRCode.save();
    res.status(201).json({ message: 'QR Code generated successfully', qrCodeImage });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
  }
});

app.post('/validate-qr', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ message: 'Data is required to validate QR code' });
  }

  try {
    const qrCode = await QRCodeModel.findOne({ data });
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }
    res.status(200).json({ message: 'QR Code is valid', qrCode });
  } catch (error) {
    console.error('Error validating QR code:', error);
    res.status(500).json({ message: 'Failed to validate QR code', error: error.message });
  }
});

// User Role Schema
const roleSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  role: { type: String, required: true }
});

const Role = mongoose.model('Role', roleSchema);

// Users hardcoded for login
const users = {
  user1: { username: "user1", password: "pass123", role: "admin" },
  user2: { username: "user2", password: "pass123", role: "user" },
};

const SECRET_KEY = "your_secret_key";

const authRoutes = require('./MongoAuthentication')();
app.use('/', authRoutes);

// LOGIN Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  //token and user role
  const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  try {
    await Role.updateOne(
      { username },
      { $set: { role: user.role } },
      { upsert: true }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Error saving role to DB:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get Role from MongoDB
app.get('/role/:username', async (req, res) => {
  try {
    const user = await Role.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User role not found" });
    res.json({ role: user.role });
  } catch (err) {
    console.error('Error retrieving role:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create (C)
app.post('/resident', async (req, res) => {
  const { 
    id, 
    firstname, 
    lastname, 
    birthday, 
    gender, 
    age, 
    address, 
    email, 
    phoneNumber, 
    civilStatus, 
    religion, 
    houseNumber, 
    purok, 
    yearsOfResidency, 
    employmentStatus, 
    occupation, 
    monthlyIncomeRange, 
    educationLevel 
  } = req.body;
  
  if (!id || 
      !firstname || 
      !lastname || 
      !birthday || 
      !gender || 
      !age || 
      !address || 
      !email || 
      !phoneNumber || 
      !civilStatus || 
      !religion || 
      !houseNumber || 
      !purok || 
      !yearsOfResidency || 
      !employmentStatus || 
      !occupation || 
      !monthlyIncomeRange || 
      !educationLevel) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const existing = await Resident.findOne({ id });
    if (existing) {
      return res.status(409).json({ message: 'This Resident ID already exists' });
    }
    const newResident = new Resident({ 
      id, 
      firstname, 
      lastname, 
      birthday, 
      gender, 
      age, 
      address, 
      email, 
      phoneNumber, 
      civilStatus, 
      religion, 
      houseNumber, 
      purok, 
      yearsOfResidency, 
      employmentStatus, 
      occupation, 
      monthlyIncomeRange, 
      educationLevel 
    });
    await newResident.save();
    res.status(201).json({ message: 'Resident saved successfully' });
  } catch (error) {
    console.error('Error saving Resident:', error);
    res.status(500).json({ message: 'Failed to save Resident' });
  }
});

app.post('/residents', async (req, res) => {
  const residents = req.body; // Expecting an array of resident objects

  // Fixed check for empty residents array
  if (!residents || residents.length === 0) {
    return res.status(400).json({ message: 'No resident data provided' });
  }

  // Validate each resident
  const requiredFields = [
    'id', 'firstname', 'lastname', 'birthday', 'gender', 'age', 'address',
    'email', 'phoneNumber', 'civilStatus', 'religion', 'houseNumber', 'purok',
    'yearsOfResidency', 'employmentStatus', 'occupation', 'monthlyIncomeRange', 'educationLevel'
  ];

  const invalidRows = residents.filter(resident =>
    requiredFields.some(field => !resident[field] && resident[field] !== 0)
  );

  if (invalidRows.length > 0) {
    return res.status(400).json({ message: `CSV contains ${invalidRows.length} row(s) with missing required fields.` });
  }

  try {
    // Filter out residents with duplicate IDs (already in DB)
    const existingIds = await Resident.find({ id: { $in: residents.map(r => r.id) } }).distinct('id');
    const newResidents = residents.filter(r => !existingIds.includes(r.id));

    if (newResidents.length === 0) {
      return res.status(409).json({ message: 'All Resident IDs already exist' });
    }

    await Resident.insertMany(newResidents);
    res.status(201).json({ message: 'Residents uploaded successfully', count: newResidents.length });
  } catch (error) {
    console.error('Error uploading residents:', error);
    res.status(500).json({ message: 'Failed to upload residents', error: error.message });
  }
});

// Read (R) - single resident
app.get('/resident/:id', async (req, res) => {
  console.log(`Fetching resident with ID: ${req.params.id}`);
  // Check if resident ID is provided
  try {
    const resident = await Resident.findOne({ id: req.params.id });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    res.json(resident);
  } catch (error) {
    console.error('Error fetching resident:', error);
    res.status(500).json({ message: 'Failed to retrieve resident' });
  }
});

// Read all residents
app.get('/residents', async (req, res) => {
debugger;
  try {
    const residents = await Resident.find();
    // Return all residents as an array
    return res.json(residents);
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({ message: 'Failed to retrieve residents' });
  }
});

// Update (U)
app.put('/resident/:id', async (req, res) => {
  console.log('Update request for ID:', req.params.id);
  const { 
    firstname, 
    lastname, 
    birthday, 
    gender, 
    age, 
    address, 
    email, 
    phoneNumber, 
    civilStatus, 
    religion, 
    houseNumber, 
    purok, 
    yearsOfResidency, 
    employmentStatus, 
    occupation, 
    monthlyIncomeRange, 
    educationLevel 
  } = req.body;
  
  // Update validation
  if (!firstname && !lastname && !birthday && !gender && !age && !address && 
      !email && !phoneNumber && !civilStatus && !religion && !houseNumber && 
      !purok && !yearsOfResidency && !employmentStatus && !occupation && 
      !monthlyIncomeRange && !educationLevel) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }
  
  try {
    const updatedResident = await Resident.findOneAndUpdate(
      { id: req.params.id },
      { $set: { 
        firstname, 
        lastname, 
        birthday, 
        gender, 
        age, 
        address, 
        email, 
        phoneNumber, 
        civilStatus, 
        religion, 
        houseNumber, 
        purok, 
        yearsOfResidency, 
        employmentStatus, 
        occupation, 
        monthlyIncomeRange, 
        educationLevel 
      } },
      { new: true, omitUndefined: true }
    );
    if (!updatedResident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    res.status(200).json({ message: 'Resident updated successfully', resident: updatedResident });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Failed to update resident' });
  }
});

// Delete (D)
app.delete('/resident/:id', async (req, res) => {
  try {
    const deleted = await Resident.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    res.status(200).json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).json({ message: 'Failed to delete resident' });
  }
});

// --------------------  MEDICAL RECORDS ENDPOINTS  -------------------- //

// Create Medical Record
app.post('/resident/:id/medical-record', async (req, res) => {
  const residentId = req.params.id;
  const { healthConditions, bloodType, vaccinationStatus, insuranceStatus, notes } = req.body;
  
  try {
    // Check if resident exists
    const resident = await Resident.findOne({ id: residentId });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    // Check if medical record already exists
    const existingRecord = await MedicalRecord.findOne({ residentId });
    if (existingRecord) {
      return res.status(409).json({ message: 'Medical record already exists for this resident' });
    }
    
    // Create new medical record
    const newMedicalRecord = new MedicalRecord({
      residentId,
      healthConditions: healthConditions || '',
      bloodType: bloodType || '',
      vaccinationStatus: vaccinationStatus || '',
      insuranceStatus: insuranceStatus || '',
      notes: notes || ''
    });
    
    await newMedicalRecord.save();
    res.status(201).json({ message: 'Medical record saved successfully' });
  } catch (error) {
    console.error('Error saving medical record:', error);
    res.status(500).json({ 
      message: 'Failed to save medical record',
      details: error.message 
    });
  }
});

// Read Medical Record
app.get('/resident/:id/medical-record', async (req, res) => {
  const residentId = req.params.id;
  console.log(`Retrieving medical record for resident ID: ${residentId}`);
  
  try {
    // Check if resident exists
    const resident = await Resident.findOne({ id: residentId });
    if (!resident) {
      console.log(`Resident ${residentId} not found`);
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    // Get medical record
    const medicalRecord = await MedicalRecord.findOne({ residentId });
    if (!medicalRecord) {
      console.log(`No medical record found for resident ${residentId}, returning empty record`);
      // Return empty record with 200 status to match Redis implementation
      return res.status(200).json({
        healthConditions: '',
        bloodType: '',
        vaccinationStatus: '',
        insuranceStatus: '',
        notes: ''
      });
    }
    
    res.status(200).json(medicalRecord);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve medical record',
      details: error.message 
    });
  }
});

// Update Medical Record
app.put('/resident/:id/medical-record', async (req, res) => {
  const residentId = req.params.id;
  const { healthConditions, bloodType, vaccinationStatus, insuranceStatus, notes } = req.body;
  
  try {
    // Check if medical record exists
    const existingRecord = await MedicalRecord.findOne({ residentId });
    if (!existingRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Update only provided fields
    const updateData = {};
    if (healthConditions) updateData.healthConditions = healthConditions;
    if (bloodType) updateData.bloodType = bloodType;
    if (vaccinationStatus) updateData.vaccinationStatus = vaccinationStatus;
    if (insuranceStatus) updateData.insuranceStatus = insuranceStatus;
    if (notes) updateData.notes = notes;
    
    await MedicalRecord.updateOne({ residentId }, { $set: updateData });
    res.status(200).json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ 
      message: 'Failed to update medical record', 
      details: error.message 
    });
  }
});

// Delete Medical Record
app.delete('/resident/:id/medical-record', async (req, res) => {
  const residentId = req.params.id;
  
  try {
    const result = await MedicalRecord.deleteOne({ residentId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ 
      message: 'Failed to delete medical record', 
      details: error.message 
    });
  }
});



// -------------------- Export Residents Data API Endpoints -------------------- //

// Example data fetch route
app.get('/residents', async (req, res) => {
  // Replace with real DB fetch
  const residents = [{residents}];
  res.json(residents);
});

// -------------------- Start Server -------------------- //

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});