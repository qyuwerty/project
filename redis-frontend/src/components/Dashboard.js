import React from 'react';
import {LayoutDashboard} from 'lucide-react';

const Dashboard = ({ 
  residents = [], 
  logs = [] 
}) => {
  // Ensure residents is always an array
  const residentList = Array.isArray(residents) ? residents : [];

  // Calculate gender distribution
  const genderGroups = residentList.reduce((acc, resident) => {
    acc[resident.gender] = (acc[resident.gender] || 0) + 1;
    return acc;
  }, {});

  // Calculate employment status distribution
  const employmentGroups = residentList.reduce((acc, resident) => {
    if (resident.employmentStatus) {
      acc[resident.employmentStatus] = (acc[resident.employmentStatus] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate education level distribution
  const educationGroups = residentList.reduce((acc, resident) => {
    if (resident.educationLevel) {
      acc[resident.educationLevel] = (acc[resident.educationLevel] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate civil status distribution
  const civilStatusGroups = residentList.reduce((acc, resident) => {
    if (resident.civilStatus) {
      acc[resident.civilStatus] = (acc[resident.civilStatus] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate average age
  const calculateAverageAge = () => {
    if (!residentList.length) return 0;
    const totalAge = residentList.reduce((sum, resident) => {
      const age = parseInt(resident?.age, 10) || 0;
      return sum + age;
    }, 0);
    return Math.round(totalAge / residentList.length);
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      
      <div className="dashboard-cards">
        <div className="dash-card">
          <h3>Total Records of Residents</h3>
          <p>{residentList.length}</p>
        </div>
        <div className="dash-card">
          <h3>Average Age of Residents</h3>
          <p>{calculateAverageAge()}</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <h4>Male Residents</h4>
          <p>{genderGroups['Male'] || 0}</p>
        </div>
        <div className="stat-item">
          <h4>Female Residents</h4>
          <p>{genderGroups['Female'] || 0}</p>
        </div>
        <div className="stat-item">
          <h4>Employed Residents</h4>
          <p>{employmentGroups['Employed'] || 0}</p>
        </div>
      </div>

      <div className="Recent-log">
        <h2>Recent Actions</h2>
        <div className="logs-container">
          {logs && logs.length > 0 ? (
            <ul className="logs-list">
              {logs.map((log, index) => (
                <li key={index} className="log-item">
                  <span className="log-time">{log.timestamp || 'N/A'}</span>
                  <span className="log-message">{log.message || 'No message'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-logs">No recent actions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;