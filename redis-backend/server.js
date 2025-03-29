const express = require('express');
const redis = require('redis');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
require('dotenv').config(console.log);

const app = express();
const PORT = process.env.PORT || 5000;

// Create Redis client
const client = redis.createClient({
    url: 'redis://@127.0.0.1:6379'
});

// Redis connection handling
client.on('error', (err) => console.error('Redis Client Error:', err));

// Connect to Redis before setting up routes
(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');

        // CORS middleware - must be before routes
        app.use(cors({
          origin: 'http://localhost:3000',
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization']
        }));
        
        // Body parser middleware
        app.use(bodyParser.json(console.log));
        
        // Auth routes
        const authRoutes = require('./Authentication')(client);
        app.use('/', authRoutes);
        

        // RBAC
        const SECRET_KEY = "your_secret_key";

        const users = {
            user1: { username: "user1", password: "pass123", role: "admin" },
            user2: { username: "user2", password: "pass123", role: "user" },
        };

        // Login endpoint
        app.post("/login", async (req, res) => {
            const { username, password } = req.body;
            const user = users[username];

            if (!user || user.password !== password) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Generate token & store role in Redis
            const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
            await client.set(username, user.role);

            res.json({ token, role: user.role });
        });

        // Get user role from Redis
        app.get("/role/:username", async (req, res) => {
            const role = await client.get(req.params.username);
            res.json({ role });
        });

      

        // --------------------      CRUD Operations - Resident DATA ------------------------------------------ //
       


        app.post('/residents', async (req, res) => {
          const { 
            id, 
            firstname, 
            lastname, 
            birthday, 
            gender, 
            age, 
            address, 
            email, 
            pnumber, 
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
        
          // Validate input fields
          if (!id || 
          !firstname || 
          !lastname || 
          !birthday || 
          !gender || 
          !age || 
          !address || 
          !email || 
          !pnumber || 
          !civilStatus || 
          !religion || 
          !houseNumber || 
          !purok || 
          !yearsOfResidency || 
          !employmentStatus || 
          !occupation || 
          !monthlyIncomeRange || 
          !educationLevel
        ) {
            return res.status(400).json({ message: 'All fields are required' });
          }
        
          try {
            // Set resident data in Redis (using object syntax for Redis v4 and above)
            const residentData = { 
              firstname, 
              lastname, 
              birthday, 
              gender, 
              age, 
              address, 
              email, 
              pnumber, 
              civilStatus, 
              religion, 
              houseNumber, 
              purok, 
              yearsOfResidency, 
              employmentStatus, 
              occupation, 
              monthlyIncomeRange, 
              educationLevel 
            };
        
            // Save resident data in Redis hash
            await client.hSet(`resident:${id}`, 'firstname', residentData.firstname);
            await client.hSet(`resident:${id}`, 'lastname', residentData.lastname);
            await client.hSet(`resident:${id}`, 'birthday', residentData.birthday);
            await client.hSet(`resident:${id}`, 'gender', residentData.gender);
            await client.hSet(`resident:${id}`, 'age', residentData.age);
            await client.hSet(`resident:${id}`, 'address', residentData.address);
            await client.hSet(`resident:${id}`, 'email', residentData.email);
            await client.hSet(`resident:${id}`, 'pnumber', residentData.pnumber);
            await client.hSet(`resident:${id}`, 'civilStatus', residentData.civilStatus);
            await client.hSet(`resident:${id}`, 'religion', residentData.religion);
            await client.hSet(`resident:${id}`, 'houseNumber', residentData.houseNumber);
            await client.hSet(`resident:${id}`, 'purok', residentData.purok);
            await client.hSet(`resident:${id}`, 'yearsOfResidency', residentData.yearsOfResidency);
            await client.hSet(`resident:${id}`, 'employmentStatus', residentData.employmentStatus);
            await client.hSet(`resident:${id}`, 'occupation', residentData.occupation);
            await client.hSet(`resident:${id}`, 'monthlyIncomeRange', residentData.monthlyIncomeRange);
            await client.hSet(`resident:${id}`, 'educationLevel', residentData.educationLevel);
        
            // Respond with success message
            res.status(201).json({ message: 'Resident saved successfully' });
          } catch (error) {
            console.error('Error saving resident:', error);
            res.status(500).json({ message: 'Failed to save resident' });
          }
        });
        


    
// Read all residents
app.get('/residents', async (req, res) => {
  const keys = await client.keys('resident:*');
  const residents = await Promise.all(keys.map(async (key) => {
    return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
  }));
  res.json(residents);
});

// Update (U)
app.put('/residents/:id', async (req, res) => {
  const id = req.params.id;
  const { 
    firstname, 
    lastname, 
    birthday, 
    gender, 
    age, 
    address, 
    email, 
    pnumber, 
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

  if (
    !firstname && !lastname && !birthday && !gender && !age && !address && 
    !email && !pnumber && !civilStatus && !religion && !houseNumber && 
    !purok && !yearsOfResidency && !employmentStatus && !occupation && 
    !monthlyIncomeRange && !educationLevel
  ) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingresident = await client.hGetAll(`resident:${id}`);
    if (Object.keys(existingresident).length === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Update resident data in Redis
    if (firstname) await client.hSet(`resident:${id}`, 'firstname', firstname);
    if (lastname) await client.hSet(`resident:${id}`, 'lastname', lastname);
    if (birthday) await client.hSet(`resident:${id}`, 'birthday', birthday);
    if (gender) await client.hSet(`resident:${id}`, 'gender', gender);
    if (age) await client.hSet(`resident:${id}`, 'age', age);
    if (address) await client.hSet(`resident:${id}`, 'address', address);
    if (email) await client.hSet(`resident:${id}`, 'email', email);
    if (pnumber) await client.hSet(`resident:${id}`, 'pnumber', pnumber);
    if (civilStatus) await client.hSet(`resident:${id}`, 'civilStatus', civilStatus);
    if (religion) await client.hSet(`resident:${id}`, 'religion', religion);
    if (houseNumber) await client.hSet(`resident:${id}`, 'houseNumber', houseNumber);
    if (purok) await client.hSet(`resident:${id}`, 'purok', purok);
    if (yearsOfResidency) await client.hSet(`resident:${id}`, 'yearsOfResidency', yearsOfResidency);
    if (employmentStatus) await client.hSet(`resident:${id}`, 'employmentStatus', employmentStatus);
    if (occupation) await client.hSet(`resident:${id}`, 'occupation', occupation);
    if (monthlyIncomeRange) await client.hSet(`resident:${id}`, 'monthlyIncomeRange', monthlyIncomeRange);
    if (educationLevel) await client.hSet(`resident:${id}`, 'educationLevel', educationLevel);

    res.status(200).json({ message: 'Resident updated successfully' });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Failed to update resident' });
  }
});



// Delete (D)
app.delete('/residents/:id', async (req, res) => {
  const id = req.params.id;
  await client.del(`resident:${id}`);
  res.status(200).json({ message: 'resident deleted successfully' });
});



  // --------------------      CRUD Operations - MEDICAL RECORDS  ------------------------------------------ //


  //CREATE OR ADD// CREATE OR ADD Medical Record
app.post('/residents/:id/medical-record', async (req, res) => {
  const id = req.params.id;
  const { healthConditions, bloodType, vaccinationStatus, insuranceStatus, notes } = req.body;

  try {
    // Check Redis connection
    if (!client.isOpen) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Save each field individually in Redis
    await client.hSet(`medical_record:${id}`, 'healthConditions', healthConditions || '');
    await client.hSet(`medical_record:${id}`, 'bloodType', bloodType || '');
    await client.hSet(`medical_record:${id}`, 'vaccinationStatus', vaccinationStatus || '');
    await client.hSet(`medical_record:${id}`, 'insuranceStatus', insuranceStatus || '');
    await client.hSet(`medical_record:${id}`, 'notes', notes || '');

    res.status(201).json({ message: 'Medical record saved successfully' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ 
      message: 'Failed to save medical record',
      details: error.message 
    });
  }
});


// READ OR FETCH Medical Record
app.get('/residents/:id/medical-record', async (req, res) => {
  const residentId = req.params.id;
  console.log(`Retrieving medical record for resident ID: ${residentId}`);

  try {
    // First check if the resident exists
    const resident = await client.hGetAll(`resident:${residentId}`);
    if (Object.keys(resident).length === 0) {
      console.log(`Resident ${residentId} not found`);
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Then try to get their medical record
    const medicalRecord = await client.hGetAll(`medical_record:${residentId}`);

    if (Object.keys(medicalRecord).length === 0) {
      console.log(`No medical record found for resident ${residentId}, returning empty record`);
      // Return an empty record with a 200 status instead of 404
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
    console.error('Fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve medical record',
      details: error.message 
    });
  }
});



// Update Medical Record
app.put('/residents/:id/medical-record', async (req, res) => {
  const residentId = req.params.id;
  const { healthConditions, bloodType, vaccinationStatus, insuranceStatus, notes } = req.body;

  try {
    // Check if the medical record exists
    const existingRecord = await client.hGetAll(`medical_record:${residentId}`);
    if (Object.keys(existingRecord).length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Update only the provided fields
    await client.hSet(`medical_record:${residentId}`, {
      ...(healthConditions && { healthConditions }),
      ...(bloodType && { bloodType }),
      ...(vaccinationStatus && { vaccinationStatus }),
      ...(insuranceStatus && { insuranceStatus }),
      ...(notes && { notes })
    });

    res.status(200).json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ message: 'Failed to update medical record', details: error.message });
  }
});


// Delete Medical Record - No option integrated for delete medical record but dre lang ni for future use
app.delete('/residents/:id/medical-record', async (req, res) => {
  const id = req.params.id;
  await client.del(`medical_record:${id}`);
  res.status(200).json({ message: 'Medical record deleted successfully' });
});

/*-------------------- EVENTS SERVER---------------------- */



    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
  });

} catch (err) {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
}
})();