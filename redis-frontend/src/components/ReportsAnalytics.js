import "./Report.css";
import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Legend, 
  LabelList,
  ComposedChart,
  Line
} from 'recharts';

const ReportsAnalytics = ({ 
  residents = [], 
  ageData = [], 
  genderData = [], 
  colors_age = ['#51a2d7', '#f39c12', '#e74c3c', '#2ecc71'],
  colors = ['#51a2d7', '#3790c0', '#2d7bad', '#206b9a', '#155987', '#9b59b6', '#2ecc71', '#e74c3c', '#f39c12', '#34495e']
}) => {
  // Defensive: ensure residents is always an array
  const residentList = Array.isArray(residents) ? residents : [];

  // Calculate gender distribution
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
    acc[resident.gender].members.push({resident});
    return acc;
  }, {});

  const genderChartData = Object.entries(genderGroups).map(([gender, data], index) => ({
    name: gender,
    value: data.count,
    color: colors[index % colors.length],
  }));

  // Calculate employment status distribution
  const employmentGroups = residentList.reduce((acc, resident) => {
    if (resident.employmentStatus) {
      acc[resident.employmentStatus] = (acc[resident.employmentStatus] || 0) + 1;
    }
    return acc;
  }, {});

  const employmentChartData = Object.entries(employmentGroups).map(([status, count], index) => ({
    name: status,
    value: count,
    color: colors[index % colors.length],
  }));

  // Calculate education level distribution
  const educationGroups = residentList.reduce((acc, resident) => {
    if (resident.educationLevel) {
      acc[resident.educationLevel] = (acc[resident.educationLevel] || 0) + 1;
    }
    return acc;
  }, {});

  const educationChartData = Object.entries(educationGroups).map(([level, count], index) => ({
    name: level,
    value: count,
    color: colors[(index + 3) % colors.length],
  }));

  // Calculate civil status distribution
  const civilStatusGroups = residentList.reduce((acc, resident) => {
    if (resident.civilStatus) {
      acc[resident.civilStatus] = (acc[resident.civilStatus] || 0) + 1;
    }
    return acc;
  }, {});

  const civilStatusChartData = Object.entries(civilStatusGroups).map(([status, count], index) => ({
    name: status,
    value: count,
    color: colors[(index + 5) % colors.length],
  }));

  // Calculate income distribution
  const incomeGroups = residentList.reduce((acc, resident) => {
    if (resident.monthlyIncomeRange) {
      acc[resident.monthlyIncomeRange] = (acc[resident.monthlyIncomeRange] || 0) + 1;
    }
    return acc;
  }, {});

  const incomeChartData = Object.entries(incomeGroups).map(([range, count], index) => ({
    name: range,
    value: count,
    color: colors[(index + 2) % colors.length],
  })).sort((a, b) => {
    // Sort income ranges in ascending order
    // Extract numbers from beginning of range
    const getFirstNumber = str => parseInt(str.match(/\d+/)?.[0] || '0');
    return getFirstNumber(a.name) - getFirstNumber(b.name);
  });

  // Calculate religion distribution
  const religionGroups = residentList.reduce((acc, resident) => {
    if (resident.religion) {
      acc[resident.religion] = (acc[resident.religion] || 0) + 1;
    }
    return acc;
  }, {});

  const religionChartData = Object.entries(religionGroups).map(([religion, count], index) => ({
    name: religion,
    value: count,
    color: colors[(index + 1) % colors.length],
  }));

  // Calculate years of residency distribution
  const residencyGroups = residentList.reduce((acc, resident) => {
    if (resident.yearsOfResidency) {
      const years = parseInt(resident.yearsOfResidency);
      if (years < 5) acc['Less than 5 years'] = (acc['Less than 5 years'] || 0) + 1;
      else if (years < 10) acc['5-9 years'] = (acc['5-9 years'] || 0) + 1;
      else if (years < 15) acc['10-14 years'] = (acc['10-14 years'] || 0) + 1;
      else if (years < 20) acc['15-19 years'] = (acc['15-19 years'] || 0) + 1;
      else acc['20+ years'] = (acc['20+ years'] || 0) + 1;
    }
    return acc;
  }, {});

  const residencyChartData = Object.entries(residencyGroups).map(([range, count], index) => ({
    name: range,
    value: count,
    color: colors[(index + 4) % colors.length],
  })).sort((a, b) => {
    const orderMap = {
      '< 5 years': 1,
      '5-9 years': 2,
      '10-14 years': 3,
      '15-19 years': 4,
      '20+ years': 5
    };
    return orderMap[a.name] - orderMap[b.name];
  });

  // Calculate purok distribution
  const purokGroups = residentList.reduce((acc, resident) => {
    if (resident.purok) {
      acc[resident.purok] = (acc[resident.purok] || 0) + 1;
    }
    return acc;
  }, {});

  const purokChartData = Object.entries(purokGroups).map(([purok, count], index) => ({
    name: purok,
    value: count,
    color: colors[(index + 6) % colors.length],
  }));

  // Calculate average age by gender
  const avgAgeByGender = {};
  const countByGender = {};
  
  residentList.forEach(resident => {
    if (resident.gender && resident.age) {
      const age = parseInt(resident.age);
      if (!isNaN(age)) {
        avgAgeByGender[resident.gender] = (avgAgeByGender[resident.gender] || 0) + age;
        countByGender[resident.gender] = (countByGender[resident.gender] || 0) + 1;
      }
    }
  });
  
  Object.keys(avgAgeByGender).forEach(gender => {
    avgAgeByGender[gender] = Math.round(avgAgeByGender[gender] / countByGender[gender]);
  });

  return (
    <div className="reports-container">
      <h2>Resident Demographics Dashboard</h2>
      
      {/* Key Statistics at Top */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card primary">
            <h4>Total Residents</h4>
            <p>{residents.length}</p>
          </div>
          <div className="stat-card">
            <h4>Average Age</h4>
            <p>
              {residents.length > 0 
                ? Math.round(residents.reduce((sum, r) => sum + parseInt(r.age || 0), 0) / residents.length) 
                : 0}
            </p>
          </div>
          <div className="stat-card">
            <h4>Gender Ratio</h4>
            <p>
              {`${genderGroups['Male']?.count || 0} : ${genderGroups['Female']?.count || 0}`}
            </p>
          </div>
          <div className="stat-card">
            <h4>Employment Rate</h4>
            <p>
              {residents.length > 0 
                ? `${Math.round((employmentGroups['Employed'] || 0) / residents.length * 100)}%` 
                : '0%'}
            </p>
          </div>
          <div className="stat-card">
            <h4>Avg Years of Residency</h4>
            <p>
              {residents.length > 0 
                ? Math.round(residents.reduce((sum, r) => sum + parseInt(r.yearsOfResidency || 0), 0) / residents.length) 
                : 0}
            </p>
          </div>
        </div>
      </div>

      <div className='chart-container'>
        {/* Age Distribution Chart */}
        <div className="chart-section">
          <h3>Age Distribution</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={ageData}
                margin={{ top: 20, right: 30, bottom: 40, left: 20 }}
              >
                <XAxis 
                  dataKey="name" 
                  label={{ value: 'Age Groups', position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  label={{ value: 'Range', angle: -90, position: 'insideLeft', offset: -5 }} 
                  tickCount={5} 
                  allowDecimals={false} 
                />
                <Tooltip />
                <Bar dataKey="value" barSize={35} radius={[10, 10, 0, 0]}>
                  {ageData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors_age[index % colors_age.length]} 
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    fill="#000" 
                    fontSize={12} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution Chart */}
        <div className="chart-section">
          <h3>Gender Distribution</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center" 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Civil Status Chart */}
        <div className="chart-section">
          <h3>Civil Status</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={civilStatusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {civilStatusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center" 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employment Status Distribution Chart */}
        <div className="chart-section">
          <h3>Employment Status</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {employmentChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center" 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Range Chart */}
        <div className="chart-section">
          <h3>Monthly Income Range</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={incomeChartData}
                margin={{ top: 20, right: 30, bottom: 70, left: 20 }}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  allowDecimals={false} 
                />
                <Tooltip />
                <Bar dataKey="value" barSize={35} radius={[10, 10, 0, 0]}>
                  {incomeChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    fill="#000" 
                    fontSize={12} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Level Chart */}
<div className="chart-section">
  <h3>Education Level</h3>
  <div className="chart-box">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={educationChartData}
        layout="vertical"
        margin={{ top: 20, right: 30, bottom: 40, left: 100 }}
      >
        <XAxis type="number" />
        <YAxis 
          dataKey="name" 
          type="category"
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Bar dataKey="value" barSize={20} radius={[0, 10, 10, 0]}>
          {educationChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
            />
          ))}
          <LabelList 
            dataKey="value" 
            position="right" 
            fill="#000" 
            fontSize={12} 
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Religion Chart */}
<div className="chart-section">
  <h3>Religion Distribution</h3>
  <div className="chart-box">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={religionChartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {religionChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center" 
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Years of Residency Chart */}
<div className="chart-section">
  <h3>Years of Residency</h3>
  <div className="chart-box">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={residencyChartData}
        margin={{ top: 20, right: 30, bottom: 40, left: 20 }}
      >
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" barSize={35} radius={[10, 10, 0, 0]}>
          {residencyChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
            />
          ))}
          <LabelList 
            dataKey="value" 
            position="top" 
            fill="#000" 
            fontSize={12} 
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* Purok Distribution Chart */}
<div className="chart-section">
  <h3>Purok Distribution</h3>
  <div className="chart-box">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={purokChartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {purokChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center" 
        />
      </PieChart>
    </ResponsiveContainer>
      </div>
    </div>
  </div>
</div>
);
};

export default ReportsAnalytics;