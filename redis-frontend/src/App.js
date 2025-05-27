import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Papa from 'papaparse';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer,LabelList,Label } from 'recharts';
import LoginPanel from './components/LoginPanel.js';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation.js';
import UserList from './components/UserList.js';
import Dashboard from './components/Dashboard.js'
import ResidentRecords from './components/ResidentRecords.js'
import ReportsAnalytics from './components/ReportsAnalytics.js'
import Household from './components/Household.js'
import QRCodeGenerator from './components/QRCodeGenerator.js';
import ExportData from './components/exportData.js';
import { LogOut, Menu, ArrowLeftToLine, CircleUserRound,PlusCircle, ChevronDown, ChevronUp, FolderKanban,
        Mail, Phone,LayoutDashboard,LibraryBig,Users,CalendarRange, ChartColumnBig,House,
        Scan} from 'lucide-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const API_URL = 'http://localhost:5000/residents';


// Visualization Component

const Visualization = ({ residents }) => {
  // Defensive: ensure residents is always an array
  const residentList = Array.isArray(residents) ? residents : [];

  const colors = ['#51a2d7', '#3790c0', '#2d7bad', '#206b9a', '#155987'];

  const genderGroups = residentList.reduce((acc, resident) => {
    if (!acc[resident.gender]) {
      acc[resident.gender] = {
        count: 0,
        members: []
      };
    }
    acc[resident.gender].count += 1;
    acc[resident.gender].members.push(resident);
    return acc;
  }, {});

  const genderData = Object.entries(genderGroups).map(([gender, data], index) => ({
    name: gender,
    value: data.count,
    color: colors[index % colors.length],
  }));

  // ...existing code for rendering...
}

//Main Function App (chrz naa diay dre tanan)
function App() {
  const [formData, setFormData] = useState({ 
    id: '', 
    firstname: '', 
    lastname: '', 
    birthday: '', 
    gender: '', 
    age: '', 
    address: '', 
    email: '', 
    phoneNumber: '', 
    civilStatus: '', 
    religion: '', 
    houseNumber: '', 
    purok: '', 
    yearsOfResidency: '', 
    employmentStatus: '', 
    occupation: '', 
    monthlyIncomeRange: '', 
    educationLevel: '' 
  });
  
  const [showViewMoreModal, setShowViewMoreModal] = useState(false); //For View more Modal
  const [residents, setresidents] = useState([]);//residents data
  const [resident, setresident] = useState([]);//single resident data
  const [isEditing, setIsEditing] = useState(false);//Editing the add/update modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);//Add/Update Modal Show/close
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');//See First Dashboard upon login
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredresidents, setFilteredresidents] = useState([]);
  const [inputMethod, setInputMethod] = useState('manual');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [residentToDeleteId, setresidentToDeleteId] = useState(null);
  const itemsPerPage = 10;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: ""
  });

  const navRef = useRef(null);

  // Define toggleModal function
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Add this to your component, near the top where you define your state
useEffect(() => {
  // Check if user data exists in localStorage when component mounts
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    
    // Update your userData state with values from localStorage
    setUserData({
      firstName: parsedUser.firstName || "",
      lastName: parsedUser.lastName || "",
      email: parsedUser.email || "",
      role: parsedUser.role || ""
    });
    
    // Also update your authentication state if needed
    setCurrentUser(parsedUser);
    setIsAuthenticated(true);
  }
}, []);


// Constant for User Roles
  const userRoles = {
    admin: ['view_residents', 'add_resident', 'edit_resident', 'delete_resident', 'view_user', 'view_visualization', 'user_info','household'],
    user: ['view_residents', 'add_resident', 'edit_resident', 'delete_resident','view_visualization', 'user_info','household' ]
  };

  // Helper functions
  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.role) return false;
    const permissions = userRoles[currentUser.role] || [];
    return permissions.includes(permission);
  };

  const checkPermission = (permission) => {
    const result = hasPermission(permission);
    console.log(`Permission check for ${permission}:`, result);
    return result;
  };
  
  // useEffect hooks
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    // Ensure storedUser is valid before parsing
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid JSON in localStorage:", error);
        localStorage.removeItem('user'); 
      }
    }
  
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  
    setLoading(false);
  }, []);
  

  useEffect(() => {
    if (isAuthenticated) {
      fetchresidents();
    }
  }, [isAuthenticated]);

  // Event handlers for Login/Logout
  const handleLogin = (user, token) => {
    console.log("Logged in user:", user); // Debug
    setCurrentUser(user);
    setIsAuthenticated(true);

      // Also update userData with the same user info
  setUserData({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    role: user.role || ""
  });
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Make sure you're saving the user!
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    addLog(`User logged in: ${user.email}`);
    toast.success('Logged in successfully!');

    // Add this somewhere visible in your component
console.log("Current user:", currentUser);
console.log("Has 'account' permission:", hasPermission('account'));
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  //-- For Logout Confirmation -- 
  const confirmLogout = () => {
    toast.success('Logged out successfully');

    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveView('dashboard');
      setShowLogoutModal(false);
      
      addLog('User logged out');
    }, 800);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleChange = (e) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

//NAVIGATION
// Handlers
const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen);
};

const handleNavClick = (view) => {
  setActiveView(view);
  setIsMenuOpen(false);
};

// Outside click handler
useEffect(() => {
  const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && !event.target.classList.contains('menu-toggle')) {
          setIsMenuOpen(false);
      }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
      document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);


// Render content based on active view
const renderContent = () => {
  const residentList = Array.isArray(residents) ? residents : [];
  switch(activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            residents={residentList}
            logs={logs}
          />
        );
      case 'table':
        return (
          <ResidentRecords 
            residents={residentList}
            filteredresidents={filteredresidents}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            setFilteredresidents={setFilteredresidents}
            setCurrentPage={setCurrentPage}
            handleOpenAddModal={handleOpenAddModal}
            handleViewMore={handleViewMore}
            handleEdit={handleEdit}
            handleAddSubmit = {handleAddSubmit} //giadd nako
            handleDelete={handleDelete}
            showDeleteModal={showDeleteModal}
            cancelDelete={cancelDelete}
            confirmDelete={confirmDelete}
          />);
      case 'UserTable':
          return <UserList />;
      case 'household':
          return <Household residents={residentList} />;    
      case 'visualization':
        return (
          <ReportsAnalytics 
            residents={residentList}
            ageData={ageData}
            genderData={genderData}
            colors_age={['#51a2d7', '#f39c12', '#e74c3c', '#2ecc71']}
            colors={['#51a2d7', '#3790c0', '#2d7bad', '#206b9a', '#155987']}
          />
        );
      case 'generate_qr':
        return <QRCodeGenerator residents={residentList} />;
      default:
        return <Dashboard 
        residents={residentList}
        logs={logs}
      />;
  }
};

//--------------------------------------------

 // When adding a new log entry
const addLog = (message) => {
  const newLog = {
    timestamp: new Date().toLocaleString(),
    message: message
  };
  
  // Update state with the new log
  const updatedLogs = [...logs, newLog];
  setLogs(updatedLogs);
  
  // Save to localStorage
  localStorage.setItem('actionLogs', JSON.stringify(updatedLogs));
  
  // Optional: You might want to limit the number of logs saved
  if (updatedLogs.length > 50) {
    const trimmedLogs = updatedLogs.slice(-50); // Keep only the last 50 logs
    setLogs(trimmedLogs);
    localStorage.setItem('actionLogs', JSON.stringify(trimmedLogs));
  }
};

// Add this to your component, near your other useEffect
useEffect(() => {
  // Load logs from localStorage
  const savedLogs = localStorage.getItem('actionLogs');
  if (savedLogs) {
    setLogs(JSON.parse(savedLogs));
  }
}, []);

  //ViewMore - Medical Record
  const [medicalRecord, setMedicalRecord] = useState({
    healthConditions: "",  // E.g., Diabetes, Hypertension, PWD
    bloodType: "",         // A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown
    vaccinationStatus: "", // E.g., COVID-19 (3 doses), Flu (2023)
    insuranceStatus: "",   // Yes - PhilHealth, Yes - Private, Yes - Both, No
    notes: "",             // Any additional health-related information
    isLoaded: false        // Tracks if the data is loaded
});


  useEffect(() => {
    console.log("useEffect triggered with formData.id:", formData.id);
    if (formData.id) {
      fetchMedicalRecord(formData.id);
    }
  }, [formData.id]);
  
  
  
//Checks resident existence
  const checkresidentExists = async (residentId) => {
    try {
      console.log('Checking resident with ID:', residentId);
      const response = await fetch(`http://localhost:5000/residents/${residentId}`);
      return response.ok;
    } catch (error) {
      console.log('Error checking resident existence:', error);
      return false;
    }
  };
  
 //Save and Update the Medical Record 
  const saveAndUpdateMedicalRecord = async () => {
  if (!formData.id) {
    alert("resident ID is required");
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/residents/${formData.id}/medical-record`, {
      method: 'POST',  // or 'PUT' if you want to update
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        healthConditions: medicalRecord.healthConditions,
        bloodType: medicalRecord.bloodType,
        vaccinationStatus: medicalRecord.vaccinationStatus,
        insuranceStatus: medicalRecord.insuranceStatus,
        notes: medicalRecord.notes
    })
    
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert("Medical record saved successfully!");
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error("Error saving medical record:", error);
    alert("Failed to save medical record");
  }
};
  
// Function to fetch medical record
const fetchMedicalRecord = async (residentId) => {
  if (!residentId) {
    console.log("Cannot fetch: No resident ID provided");
    return;
  }
  
  console.log(`Attempting to fetch medical record for resident ID: ${residentId}`);
  
  try {
    const response = await fetch(`http://localhost:5000/residents/${residentId}/medical-record`);
    console.log("Fetch response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Raw data received from server:", data);
      
      // Important: Directly set the state with the received data
     setMedicalRecord({
    healthConditions: data.healthConditions || "",
    bloodType: data.bloodType || "",
    vaccinationStatus: data.vaccinationStatus || "",
    insuranceStatus: data.insuranceStatus || "",
    notes: data.notes || "",
    isLoaded: true // Assuming you want to mark the data as loaded when fetched
});

console.log("Medical record state updated:", {
    healthConditions: data.healthConditions || "",
    bloodType: data.bloodType || "",
    vaccinationStatus: data.vaccinationStatus || "",
    insuranceStatus: data.insuranceStatus || "",
    notes: data.notes || ""
});

    } else if (response.status === 404) {
      // Only show error for actual missing residents, not for residents without records
      if ((await response.json()).message === 'resident not found') {
        console.error("resident not found")
       //alert("resident not found");
      } else {
        // Reset to empty form for new records
        setMedicalRecord({
          healthConditions: "",
          bloodType: "",
          vaccinationStatus: "",
          insuranceStatus: "",
          notes: "",
         // isLoaded: false // Reset to indicate no data is loaded
      });
      
      }
    } else {
      console.error("Server returned error:", response.status);
      alert(`Server error. Please try again later.`);
    }
  } catch (error) {
    console.error("Exception when fetching medical record:", error);
  }
};


const handleInputChange = (e) => {
  const { name, value } = e.target;
  console.log(`Updating ${name} to "${value}"`);
  setMedicalRecord(prev => ({
    ...prev,
    [name]: value
  }));
};

const fetchresident = async (residentId) => {
  try {
    const response = await axios.get(`http://localhost:5000/resident/${residentId}`);
    setresident(response.data);
    console.log('Fetched resident:', response.data);
  } catch (error) {
    setresidentToDeleteId([]);
    console.error('Error fetching resident:', error);
    toast.error('Failed to fetch resident data');
  }
};

  //resident API CALLS ?
  const fetchresidents = async () => {
    try {
      const response = await axios.get(API_URL);
      setresidents(response.data);
      console.log('Fetched residents:', response.data, Array.isArray(response.data));
    } catch (error) {
      setresidents([]);
      console.error('Error fetching residents:', error);
      toast.error('Failed to fetch residents data');
    }
  };

//-------------

//-- Search Function -- 
const handleSearch = () => {
  // Accessing residents from state or props, not trying to access a variable before declaration
  const residentsData = Array.isArray(residents) ? residents : [];
  
  const filtered = residentsData.filter(resident =>
    (`${resident.firstname} ${resident.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resident.id && resident.id.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  setFilteredresidents(filtered);
  setCurrentPage(1);

  if (searchTerm.trim() === "") {
    toast.error("Please enter a search term");
  } else if (filtered.length > 0) {
    toast.success(`${filtered.length} result(s) found for "${searchTerm}"`, {
      style: { backgroundColor: "#fff", color: "#000" },
      progressStyle: { backgroundColor: "#007bff" }
    });
    
  } else {
    toast.error("resident not found");
  }
};

 //-- ADD resident Record (Basic Details) via CSV -- 
  const handleCSVUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    complete: async (result) => {
      const csvData = result.data
        .filter(row => Object.values(row).some(value => value && String(value).trim()))
        .map(resident => ({
          id: resident.id?.toString().trim(),
          firstname: resident.firstname?.toString().trim(),
          lastname: resident.lastname?.toString().trim(),
          birthday: resident.birthday?.toString().trim(),
          gender: resident.gender?.toString().trim(),
          age: resident.age ? parseInt(resident.age.toString().trim(), 10) : null,
          address: resident.address?.toString().trim(),
          email: resident.email?.toString().trim(),
          phoneNumber: resident.phoneNumber?.toString().trim(),
          civilStatus: resident.civilStatus?.toString().trim(),
          religion: resident.religion?.toString().trim(),
          houseNumber: resident.houseNumber?.toString().trim(),
          purok: resident.purok?.toString().trim(),
          yearsOfResidency: resident.yearsOfResidency ? parseInt(resident.yearsOfResidency.toString().trim(), 10) : null,
          employmentStatus: resident.employmentStatus?.toString().trim(),
          occupation: resident.occupation?.toString().trim(),
          monthlyIncomeRange: resident.monthlyIncomeRange?.toString().trim(),
          educationLevel: resident.educationLevel?.toString().trim(),
        }));

      const invalidRows = csvData.filter(resident => {
        return !resident.id ||
               !resident.firstname ||
               !resident.lastname ||
               !resident.birthday ||
               !resident.gender ||
               resident.age === null ||
               !resident.address ||
               !resident.email ||
               !resident.phoneNumber ||
               !resident.civilStatus ||
               !resident.religion ||
               !resident.houseNumber ||
               !resident.purok ||
               resident.yearsOfResidency === null ||
               !resident.employmentStatus ||
               !resident.occupation ||
               !resident.monthlyIncomeRange ||
               !resident.educationLevel;
      });

      if (invalidRows.length > 0) {
        toast.error(`CSV contains ${invalidRows.length} row(s) with missing required fields.`);
        return;
      }

      if (csvData.length === 0) {
        toast.error('No valid data found in CSV');
        return;
      }

      try {
        // Fixed endpoint to use /residents for bulk upload
        await axios.post('http://localhost:5000/residents', csvData);
        toast.success('CSV uploaded successfully!');
        fetchresidents();
        addLog(`Uploaded residents data ${csvData.length} row(s)`);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Error uploading CSV: ${errorMessage}`);
      }
    },
    error: (error) => {
      console.error('Papa Parse error:', error);
      toast.error('Error parsing CSV file');
    }
  });
};


  //-- ADD resident Record (Basic Details) Manually  -- 
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log('Form data being sent:', formData);
        const response = await axios.post('http://localhost:5000/resident', formData);
        console.log('Response:', response);
        toast.success('resident added successfully!');
        fetchresidents();

        const residentName = `${formData.firstname} ${formData.lastname}`;
        addLog(`Added resident: ${residentName}`);

        setFormData({ 
          id: '', 
          firstname: '', 
          lastname: '', 
          birthday: '', 
          gender: '', 
          age: '', 
          address: '', 
          email: '', 
          phoneNumber: '', 
          civilStatus: '', 
          religion: '', 
          houseNumber: '', 
          purok: '', 
          yearsOfResidency: '', 
          employmentStatus: '', 
          occupation: '', 
          monthlyIncomeRange: '', 
          educationLevel: '' 
        });
        
        setIsFormModalOpen(false);

    } catch (error) {
        console.error('Error details:', error.response);
        toast.error('Error adding resident!');
        toast.error(`Error adding resident: ${error.message}`);
    }
};

   //-- DELETE resident Record --    
  const handleDelete = (id) => {
    setresidentToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (!residentToDeleteId) {
        toast.error('No resident selected for deletion!');
        return;
      }

      const residentToDelete = residents.find(resident => resident.id === residentToDeleteId);
      const residentName = residentToDelete ? `${residentToDelete.firstname} ${residentToDelete.lastname}` : 'Unknown';

      await axios.delete(`http://localhost:5000/resident/${residentToDeleteId}`);
      
      toast.success('resident deleted!');
      fetchresidents();
      setShowDeleteModal(false);
      setresidentToDeleteId(null);
      addLog(`Deleted resident: ${residentName}`);

    } catch (error) {
      toast.error('Error deleting resident!');
      console.error(error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setresidentToDeleteId(null);
  };

  //-- READ - VIEW MORE resident Record --    
  const handleViewMore = (resident) => {
    setFormData(resident);
    fetchMedicalRecord(resident.id);
    setShowViewMoreModal(true);
  };

  //UPDATE resident Record
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/resident/${formData.id}`, formData);
      toast.success('resident updated successfully!');
      fetchresidents();
      addLog(`Updated resident: ${formData.firstname} ${formData.lastname}`);
      setFormData({ 
        id: '', 
        firstname: '', 
        lastname: '', 
        birthday: '', 
        gender: '', 
        age: '', 
        address: '', 
        email: '', 
        phoneNumber: '', 
        civilStatus: '', 
        religion: '', 
        houseNumber: '', 
        purok: '', 
        yearsOfResidency: '', 
        employmentStatus: '', 
        occupation: '', 
        monthlyIncomeRange: '', 
        educationLevel: '' 
      });
      
      setIsEditing(false);
      setIsFormModalOpen(false);
    } catch (error) {
      toast.error('Error updating resident!');
    }
  };
  
  //Modal For Add/Update resident Record
  const handleOpenAddModal = () => {
    setFormData({ 
      id: '', 
      firstname: '', 
      lastname: '', 
      birthday: '', 
      gender: '', 
      age: '', 
      address: '', 
      email: '', 
      phoneNumber: '', 
      civilStatus: '', 
      religion: '', 
      houseNumber: '', 
      purok: '', 
      yearsOfResidency: '', 
      employmentStatus: '', 
      occupation: '', 
      monthlyIncomeRange: '', 
      educationLevel: '' 
    });
    
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (resident) => {
    setFormData(resident);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  // Data processing for visualizations
  const residentList = Array.isArray(residents) ? residents : [];
  const genderGroups = residentList.reduce((acc, resident) => {
  // Create the group if it doesn't exist yet
  if (!acc[resident.gender]) {
    acc[resident.gender] = {
      count: 0,
      members: []
    };
  }
  
  // Update the count and add the resident to this gender group
  acc[resident.gender].count += 1;
  acc[resident.gender].members.push(resident);
  
  return acc;
}, {});

  const genderData = Object.entries(genderGroups).map(([gender, data]) => ({
    name: gender,
    value: data.count
  }));

  const ageDistribution = residentList.reduce((acc, resident) => {
    const age = parseInt(resident.age, 10) || 0;
    const ageGroup = `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4}`;
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  const ageData = Object.entries(ageDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const genderList = [...new Set(residentList.map(resident => resident.gender))];

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  

  if (!isAuthenticated) {
    return <LoginPanel onLogin={handleLogin} />;


  }

 // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];







  


//RETURN STATEMENT NA****






return (
  <Router>
    <Routes>
      <Route
        path="/"
        element={
          <>
            <div
              className={`app-wrapper ${isMenuOpen ? 'menu-open' : ''}`}
              style={{
                backgroundImage: "url('/images/dodiongan-falls.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh"
              }}
            >
              <div className="HeaderContainer">
                <button className='account-btns' onClick={toggleModal}>
                  <CircleUserRound size={28} />
                </button>
      
                {isModalOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-arrow"></div>
                    <div className="user-info">
                      <CircleUserRound size={36} />
                      <div className="user-details">
                        <p className="user-name">{`${userData.firstName} ${userData.lastName}`}</p>
                        <p className="user-role">{userData.role}</p>
                      </div>
                    </div>
                    <div className="contact-section">
                      <p className="contact-heading">Contact Information</p>
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{userData.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                <header className="header">
                  <button 
                    onClick={toggleMenu} 
                    className="menu-toggle"
                    aria-label="Toggle menu"
                  >
                    {isMenuOpen ? <ArrowLeftToLine size={24} /> : <Menu size={24} />}
                  </button>
                </header>
              </div>

              <div className="main-content-wrapper">
                <div 
                  ref={navRef}
                  className={`side-navigation ${isMenuOpen ? 'open' : ''}`}
                >
                  <div className="menu-content">
                    <h1 className="title">Menu</h1>
        
                    <div className="nav-buttons">
                      <button 
                        onClick={() => handleNavClick('dashboard')}
                        className="nav-button"
                      >
                        <LayoutDashboard size={20} style={{ verticalAlign: "middle", marginRight: "10px" }} />Dashboard
                      </button>
        
                      {hasPermission('view_residents') && (
                        <button 
                          onClick={() => handleNavClick('table')}
                          className="nav-button"
                        >
                          <LibraryBig size={20} style={{ verticalAlign: "middle", marginRight: "10px" }}  />  Resident Records 
                        </button>
                      )}

                      {hasPermission('view_user') && (
                        <button 
                          onClick={() => handleNavClick('UserTable')}
                          className="nav-button"
                        >
                          <Users size={20} style={{ verticalAlign: "middle", marginRight: "10px" }} />  User Management
                        </button>
                      )}

                      {hasPermission('household') && (
                        <button 
                          onClick={() => handleNavClick('household')}
                          className="nav-button"
                        >
                          <House size={20} style={{ verticalAlign: "middle", marginRight: "10px" }}/>  Household
                        </button>
                      )}
                            
                      {hasPermission('view_visualization') && (
                        <button 
                          onClick={() => handleNavClick('visualization')}
                          className="nav-button"
                        >
                          <ChartColumnBig size={20} style={{ verticalAlign: "middle", marginRight: "10px" }} />  Reports & Analytics
                        </button>
                      )}

                      <button 
                        onClick={() => handleNavClick('generate_qr')}
                        className="nav-button"
                      >
                        <Scan size={20} style={{ verticalAlign: "middle", marginRight: "10px" }} /> Generate into QR
                      </button>
                            
                      <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                </div>

                <div className="content-section">
                  {renderContent()}
                </div>
              </div>
            </div>  

            {showLogoutModal && (
              <div className="modal-overlay-logout">
                <div className="modal-card-logout">
                  <h3>Are you sure you want to logout?</h3>
                  <div className="modal-actions-out">
                    <button onClick={cancelLogout} className="cancel-btn">
                      Cancel
                    </button>
                    <button onClick={confirmLogout} className="confirm-btn">
                      Confirm Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isFormModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>{isEditing ? "Update resident Information" : "Add resident Information"}</h2>
                  {/* Input Method Selector */}
                  {!isEditing && (
                    <div className="input-method-selector">
                      <label>
                        Method:
                        <select
                          value={inputMethod}
                          onChange={(e) => setInputMethod(e.target.value)}
                        >
                          <option value="manual">Manual Entry</option>
                          <option value="csv">Upload CSV</option>
                        </select>
                      </label>
                    </div>
                  )}
                  {/* Form Content */}
                  {inputMethod === 'manual' ? (
                    <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
                      {/* Identification Section */}
                      <div className="form-section">
                        <div className="section-title">
                          <i className="fa fa-id-card"></i> Identification
                        </div>
                        <div className="form-grid">
                          <div className="full-width">
                            <label className="required-field">
                              ID:
                              <input
                                type="text"
                                name="id"
                                placeholder="Resident ID"
                                value={formData.id}
                                onChange={handleChange}
                                required
                                disabled={isEditing}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      {/* Personal Information Section */}
                      <div className="form-section">
                        <div className="section-title">
                          <i className="fa fa-user"></i> Personal Information
                        </div>
                        <div className="form-grid">
                          <div>
                            <label className="required-field">
                              First Name:
                              <input
                                type="text"
                                name="firstname"
                                placeholder="First Name"
                                value={formData.firstname}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Last Name:
                              <input
                                type="text"
                                name="lastname"
                                placeholder="Last Name"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Birthday:
                              <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Age:
                              <input
                                type="number"
                                name="age"
                                placeholder="Age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Gender:
                              <select name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="" disabled>Select Gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                              </select>
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Civil Status:
                              <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required>
                                <option value="" disabled>Select Civil Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Divorced">Divorced</option>
                              </select>
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Religion:
                              <input
                                type="text"
                                name="religion"
                                placeholder="Religion"
                                value={formData.religion}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      {/* Contact Information Section */}
                      <div className="form-section">
                        <div className="section-title">
                          <i className="fa fa-address-book"></i> Contact Information
                        </div>
                        <div className="form-grid">
                          <div className="medium-width">
                            <label className="required-field">
                              Email:
                              <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Phone Number:
                              <input
                                type="number"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      {/* Residence Information Section */}
                      <div className="form-section">
                        <div className="section-title">
                          <i className="fa fa-home"></i> Residence Information
                        </div>
                        <div className="form-grid">
                          <div className="full-width">
                            <label className="required-field">
                              Complete Address:
                              <input
                                type="text"
                                name="address"
                                placeholder="Complete Address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              House Number:
                              <input
                                type="number"
                                name="houseNumber"
                                placeholder="House Number"
                                value={formData.houseNumber}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Purok:
                              <input
                                type="text"
                                name="purok"
                                placeholder="Purok"
                                value={formData.purok}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Years of Residency:
                              <input
                                type="number"
                                name="yearsOfResidency"
                                placeholder="Years of Residency"
                                value={formData.yearsOfResidency}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      {/* Socioeconomic Information Section */}
                      <div className="form-section">
                        <div className="section-title">
                          <i className="fa fa-briefcase"></i> Socioeconomic Information
                        </div>
                        <div className="form-grid">
                          <div>
                            <label className="required-field">
                              Employment Status:
                              <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required>
                                <option value="" disabled>Select Employment Status</option>
                                <option value="Employed">Employed</option>
                                <option value="Unemployed">Unemployed</option>
                                <option value="Self-Employed">Self-Employed</option>
                                <option value="Retired">Retired</option>
                                <option value="Student">Student</option>
                              </select>
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Occupation / Job Title:
                              <input
                                type="text"
                                name="occupation"
                                placeholder="Occupation / Job Title"
                                value={formData.occupation}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Monthly Income Range:
                              <input
                                type="text"
                                name="monthlyIncomeRange"
                                placeholder="Monthly Income Range"
                                value={formData.monthlyIncomeRange}
                                onChange={handleChange}
                                required
                              />
                            </label>
                          </div>
                          <div>
                            <label className="required-field">
                              Education Level:
                              <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} required>
                                <option value="" disabled>Select Education Level</option>
                                <option value="No Formal Education">No Formal Education</option>
                                <option value="Elementary">Elementary</option>
                                <option value="High School">High School</option>
                                <option value="College">College</option>
                                <option value="Vocational">Vocational</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                      {/* Form Actions */}
                      <div className="form-actions">
                        <button type="button" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
                        <button type="submit">{isEditing ? "Update Resident" : "Add Resident"}</button>
                      </div>
                    </form>
                  ) : (
                    /* Upload CSV */
                    <div className="csv-upload">
                      <input type="file" accept=".csv" onChange={handleCSVUpload} />
                      <button
                        className="close-btn"
                        type="button"
                        onClick={() => setIsFormModalOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showViewMoreModal && (
              <div className="modal-overlay-view">
                <div className="modal-content view-modal">
                  <h2 className="form-title">Resident Information</h2>
                  <div className="info-container">
                    {/* Personal Information Section */}
                    <div className="info-section">
                      <div className="section-title">
                        <i className="fa fa-user"></i> Personal Information
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">ID:</span>
                          <span className="info-value">{formData.id}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">First Name:</span>
                          <span className="info-value">{formData.firstname}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Last Name:</span>
                          <span className="info-value">{formData.lastname}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Birthday:</span>
                          <span className="info-value">{formData.birthday}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Age:</span>
                          <span className="info-value">{formData.age}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Gender:</span>
                          <span className="info-value">{formData.gender}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Civil Status:</span>
                          <span className="info-value">{formData.civilStatus}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Religion:</span>
                          <span className="info-value">{formData.religion}</span>
                        </div>
                      </div>
                    </div>
                    {/* Contact Information Section */}
                    <div className="info-section">
                      <div className="section-title">
                        <i className="fa fa-address-book"></i> Contact Information
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Email:</span>
                          <span className="info-value">{formData.email}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Phone Number:</span>
                          <span className="info-value">{formData.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                    {/* Residence Information Section */}
                    <div className="info-section">
                      <div className="section-title">
                        <i className="fa fa-home"></i> Residence Information
                      </div>
                      <div className="info-grid">
                        <div className="info-item full-width">
                          <span className="info-label">Complete Address:</span>
                          <span className="info-value">{formData.address}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">House Number:</span>
                          <span className="info-value">{formData.houseNumber}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Purok:</span>
                          <span className="info-value">{formData.purok}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Years of Residency:</span>
                          <span className="info-value">{formData.yearsOfResidency}</span>
                        </div>
                      </div>
                    </div>
                    {/* Socioeconomic Information Section */}
                    <div className="info-section">
                      <div className="section-title">
                        <i className="fa fa-briefcase"></i> Socioeconomic Information
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Employment Status:</span>
                          <span className="info-value">{formData.employmentStatus}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Occupation:</span>
                          <span className="info-value">{formData.occupation}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Monthly Income Range:</span>
                          <span className="info-value">{formData.monthlyIncomeRange}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Education Level:</span>
                          <span className="info-value">{formData.educationLevel}</span>
                        </div>
                      </div>
                    </div>
                    {/* Health Information Toggle Button */}
                    <div className="toggle-section">
                      <button 
                        className="toggle-button"
                        onClick={() => setShowMedicalRecord(!showMedicalRecord)}
                      >
                        <i className={`fa fa-${showMedicalRecord ? 'minus' : 'plus'}-circle`}></i>
                        {showMedicalRecord ? "Hide Health Information" : "View Health Information"}
                      </button>
                    </div>
                    {/* Health Information Section (conditionally rendered) */}
                    {showMedicalRecord && (
                      <div className="info-section health-section">
                        <div className="section-title">
                          <i className="fa fa-heartbeat"></i> Health & Special Considerations
                        </div>
                        <div className="health-form">
                          <div className="form-grid">
                            <div className="medium-width">
                              <label>
                                Health Conditions / Disabilities:
                                <input 
                                  type="text" 
                                  name="healthConditions" 
                                  value={medicalRecord.healthConditions || ""} 
                                  onChange={handleInputChange} 
                                  placeholder="E.g., Diabetes, Hypertension, PWD" 
                                />
                              </label>
                            </div>
                            <div>
                              <label>
                                Blood Type:
                                <select 
                                  name="bloodType" 
                                  value={medicalRecord.bloodType || ""} 
                                  onChange={handleInputChange}
                                >
                                  <option value="" disabled>Select Blood Type</option>
                                  <option value="A+">A+</option>
                                  <option value="A-">A-</option>
                                  <option value="B+">B+</option>
                                  <option value="B-">B-</option>
                                  <option value="AB+">AB+</option>
                                  <option value="AB-">AB-</option>
                                  <option value="O+">O+</option>
                                  <option value="O-">O-</option>
                                  <option value="Unknown">Unknown</option>
                                </select>
                              </label>
                            </div>
                            <div className="medium-width">
                              <label>
                                Vaccination Status:
                                <input 
                                  type="text" 
                                  name="vaccinationStatus" 
                                  value={medicalRecord.vaccinationStatus || ""} 
                                  onChange={handleInputChange} 
                                  placeholder="E.g., COVID-19 (3 doses), Flu (2023)" 
                                />
                              </label>
                            </div>
                            <div>
                              <label>
                                PhilHealth / Insurance:
                                <select 
                                  name="insuranceStatus" 
                                  value={medicalRecord.insuranceStatus || ""} 
                                  onChange={handleInputChange}
                                >
                                  <option value="" disabled>Select Insurance Status</option>
                                  <option value="Yes - PhilHealth">Yes - PhilHealth</option>
                                  <option value="Yes - Private">Yes - Private</option>
                                  <option value="Yes - Both">Yes - Both</option>
                                  <option value="No">No</option>
                                </select>
                              </label>
                            </div>
                            <div className="full-width">
                              <label>
                                Additional Health Notes:
                                <textarea 
                                  name="notes" 
                                  value={medicalRecord.notes || ""} 
                                  onChange={handleInputChange} 
                                  placeholder="Any additional health-related information"
                                  rows="3"
                                ></textarea>
                              </label>
                            </div>
                          </div>
                          <div className="health-actions">
                            <button 
                              className="save-button" 
                              onClick={saveAndUpdateMedicalRecord}
                            >
                              <i className="fa fa-save"></i> Save Health Information
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Modal Actions */}
                  <div className="modal-actions">
                    <button 
                      className="close-button" 
                      onClick={() => setShowViewMoreModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            <ToastContainer />
          </>
        }
      />
      <Route path="/export" element={<ExportData />} />
    </Routes>
  </Router>
);
}


export default App;
