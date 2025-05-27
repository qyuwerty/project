import React, { useState, useEffect } from 'react';
import './Household.css';
import {MapPinHouse } from 'lucide-react';

const Household = ({ residents = [] }) => {
  // Defensive: ensure residents is always an array
  const residentList = Array.isArray(residents) ? residents : [];
  const [households, setHouseholds] = useState([]);
  const [editingHousehold, setEditingHousehold] = useState(null);

  // Group residents into households on component mount or when residents change
  useEffect(() => {
    // Group residents by house number only (not address)
    const groupByHousehold = () => {
      const householdMap = {};
      
      residentList.forEach(resident => {
        // Use only house number as the key for each household
        const householdKey = `${resident.houseNumber}`;
        
        if (!householdMap[householdKey]) {
          householdMap[householdKey] = {
            id: householdKey,
            houseNumber: resident.houseNumber,
            purok: resident.purok,
            addresses: [resident.address],
            primaryAddress: resident.address,
            members: [],
            headOfFamilyId: null,
            relationships: {},
            totalIncome: 0,
            livingConditionScore: 0
          };
        } else if (!householdMap[householdKey].addresses.includes(resident.address)) {
          householdMap[householdKey].addresses.push(resident.address);
        }
        
        householdMap[householdKey].members.push({
          ...resident,
          id: `${resident.firstname}-${resident.lastname}-${resident.birthday}`
        });
      });
      
      // Convert map to array and calculate additional household metrics
      const householdArray = Object.values(householdMap).map(household => {
        // Find the most common address and set as primary
        const addressCount = {};
        household.addresses.forEach(addr => {
          addressCount[addr] = (addressCount[addr] || 0) + 1;
        });
        
        let maxCount = 0;
        let primaryAddress = household.primaryAddress;
        
        Object.entries(addressCount).forEach(([addr, count]) => {
          if (count > maxCount) {
            maxCount = count;
            primaryAddress = addr;
          }
        });
        
        household.primaryAddress = primaryAddress;
        
        // For initial setup, set head of family (can be edited later)
        // Default to oldest adult
        const adults = household.members.filter(m => m.age >= 18);
        if (adults.length > 0) {
          adults.sort((a, b) => b.age - a.age);
          household.headOfFamilyId = adults[0].id;
        } else if (household.members.length > 0) {
          household.members.sort((a, b) => b.age - a.age);
          household.headOfFamilyId = household.members[0].id;
        }
        
        // Calculate total household income
        household.totalIncome = calculateTotalIncome(household.members);
        
        // Assess living conditions
        household.livingConditionScore = assessLivingConditions(household);
        
        return household;
      });
      
      return householdArray;
    };
    
    setHouseholds(groupByHousehold());
  }, [residentList]);

  // Calculate total household income
  const calculateTotalIncome = (members) => {
    const getIncomeValue = (incomeRange) => {
      const ranges = {
        "below 5,000": 2500,
        "5,000 - 10,000": 7500,
        "10,001 - 20,000": 15000,
        "20,001 - 30,000": 25000,
        "above 30,000": 35000
      };
      return ranges[incomeRange] || 0;
    };

    return members.reduce((total, member) => {
      if (member.employmentStatus === "Employed") {
        return total + getIncomeValue(member.monthlyIncomeRange);
      }
      return total;
    }, 0);
  };

  // Assess living conditions
  const assessLivingConditions = (household) => {
    const members = household.members;
    
    if (members.length === 0) return 0;
    
    const incomePerMember = household.totalIncome / members.length;
    const employedMembers = members.filter(m => m.employmentStatus === "Employed").length;
    const employmentRate = members.length > 0 ? employedMembers / members.length : 0;
    const avgEducationLevel = calculateAverageEducationLevel(members);
    
    const incomeScore = scoreIncome(incomePerMember) * 0.4;
    const educationScore = avgEducationLevel * 0.3;
    const employmentScore = employmentRate * 0.2;
    const residencyScore = Math.min(
      members.reduce((avg, m) => avg + (m.yearsOfResidency || 0), 0) / members.length / 10, 
      1
    ) * 0.1;
    
    return incomeScore + educationScore + employmentScore + residencyScore;
  };
  
  const scoreIncome = (incomePerMember) => {
    if (incomePerMember < 1000) return 0.1;
    if (incomePerMember < 3000) return 0.3;
    if (incomePerMember < 5000) return 0.5;
    if (incomePerMember < 10000) return 0.7;
    if (incomePerMember < 15000) return 0.9;
    return 1.0;
  };
  
  const calculateAverageEducationLevel = (members) => {
    const levelToScore = {
      "None": 0,
      "Elementary": 0.25,
      "High School": 0.5,
      "Vocational": 0.7,
      "College": 0.85,
      "Post-Graduate": 1
    };
    
    if (members.length === 0) return 0;
    
    let totalScore = members.reduce((sum, member) => {
      return sum + (levelToScore[member.educationLevel] || 0);
    }, 0);
    
    return totalScore / members.length;
  };

  // Set head of family
  const setHeadOfFamily = (householdId, memberId) => {
    setHouseholds(prevHouseholds => {
      return prevHouseholds.map(household => {
        if (household.id === householdId) {
          return {
            ...household,
            headOfFamilyId: memberId
          };
        }
        return household;
      });
    });
  };

  // Set relationship to head of family
  const setRelationship = (householdId, memberId, relationship) => {
    setHouseholds(prevHouseholds => {
      return prevHouseholds.map(household => {
        if (household.id === householdId) {
          return {
            ...household,
            relationships: {
              ...household.relationships,
              [memberId]: relationship
            }
          };
        }
        return household;
      });
    });
  };

  // Set primary address for household
  const setPrimaryAddress = (householdId, address) => {
    setHouseholds(prevHouseholds => {
      return prevHouseholds.map(household => {
        if (household.id === householdId) {
          return {
            ...household,
            primaryAddress: address
          };
        }
        return household;
      });
    });
  };

  // Handle editing household
  const startEditing = (household) => {
    setEditingHousehold({...household});
  };

  const cancelEditing = () => {
    setEditingHousehold(null);
  };

  const saveEditing = () => {
    if (!editingHousehold) return;
    
    setHouseholds(prevHouseholds => {
      return prevHouseholds.map(household => {
        if (household.id === editingHousehold.id) {
          return {...editingHousehold};
        }
        return household;
      });
    });
    
    setEditingHousehold(null);
  };

  // Edit form for household
  const renderEditForm = () => {
    if (!editingHousehold) return null;
    
    return (
      <div className="household-edit-form">
        <h3>Edit Household #{editingHousehold.houseNumber}</h3>
        
        <div className="form-group">
          <label>Primary Address:</label>
          <select 
            value={editingHousehold.primaryAddress} 
            onChange={e => setEditingHousehold({
              ...editingHousehold,
              primaryAddress: e.target.value
            })}
          >
            {editingHousehold.addresses.map(addr => (
              <option key={addr} value={addr}>{addr}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Head of Family:</label>
          <select 
            value={editingHousehold.headOfFamilyId} 
            onChange={e => setEditingHousehold({
              ...editingHousehold,
              headOfFamilyId: e.target.value
            })}
          >
            {editingHousehold.members.map(member => (
              <option key={member.id} value={member.id}>
                {member.firstname} {member.lastname}, {member.age}
              </option>
            ))}
          </select>
        </div>
        
        <h4>Member Relationships:</h4>
        {editingHousehold.members.map(member => (
          <div key={member.id} className="form-group">
            <label>{member.firstname} {member.lastname}:</label>
            <select 
              value={editingHousehold.relationships[member.id] || 
                     (member.id === editingHousehold.headOfFamilyId ? 'Head of Family' : '')}
              onChange={e => {
                const newRelationships = {...editingHousehold.relationships};
                if (e.target.value === 'Head of Family') {
                  // Set as head of family
                  setEditingHousehold({
                    ...editingHousehold,
                    headOfFamilyId: member.id
                  });
                  delete newRelationships[member.id];
                } else {
                  newRelationships[member.id] = e.target.value;
                }
                setEditingHousehold({
                  ...editingHousehold,
                  relationships: newRelationships
                });
              }}
            >
              <option value="">Select relationship</option>
              <option value="Head of Family">Head of Family</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Grandchild">Grandchild</option>
              <option value="Sibling">Sibling</option>
              <option value="In-Law">In-Law</option>
              <option value="Other Relative">Other Relative</option>
              <option value="Non-Relative">Non-Relative</option>
            </select>
          </div>
        ))}
        
        <div className="button-group">
          <button onClick={saveEditing}>Save Changes</button>
          <button onClick={cancelEditing}>Cancel</button>
        </div>
      </div>
    );
  };

  // Render the household list
  return (
    <div className="households-container">
      <h2>Household Profiles ({households.length})</h2>
      
      {editingHousehold ? (
        renderEditForm()
      ) : (
        <div className="household-list">
          {households.map(household => {
            const headOfFamily = household.members.find(m => m.id === household.headOfFamilyId);
            
            return (
              <div key={household.id} className="household-card">
                <h3 style={{  gap: "8px" }}> <MapPinHouse /> Household #{household.houseNumber}</h3>

                <div className="household-details">
                  <p>
                    <strong>Primary Address:</strong> {household.primaryAddress}
                    {household.addresses.length > 1 && 
                      <span className="address-note"> (+ {household.addresses.length - 1} other addresses)</span>}
                  </p>
                  <p><strong>Purok:</strong> {household.purok}</p>
                  <p>
                    <strong>Head of Family:</strong> {headOfFamily ? 
                      `${headOfFamily.firstname} ${headOfFamily.lastname}` : 
                      'Not assigned'}
                  </p>
                  <p><strong>Total Household Income:</strong> ₱{household.totalIncome.toLocaleString()}</p>
                  <p><strong>Living Condition Score:</strong> {(household.livingConditionScore * 10).toFixed(1)}/10</p>
                  
                  <h4>Household Members ({household.members.length})</h4>
                  <ul className="member-list">
                    {household.members.map(member => (
                      <li key={member.id}>
                        <strong>{member.firstname} {member.lastname}</strong>, {member.age} - 
                        {member.id === household.headOfFamilyId ? 
                          <span className="relationship head">Head of Family</span> : 
                          <span className="relationship">
                            {household.relationships[member.id] || 'Member'}
                          </span>}
                        {member.employmentStatus === "Employed" && 
                          <span className="occupation"> - {member.occupation}</span>}
                        {member.address !== household.primaryAddress && 
                          <span className="different-address"> (Address: {member.address})</span>}
                      </li>
                    ))}
                  </ul>
                  
                  <button onClick={() => startEditing(household)} className="edit-button">
                    Edit Household Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Household;