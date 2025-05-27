import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeGenerator.css';

const QRCodeGenerator = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await fetch("http://localhost:5000/residents", {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch residents");
        }
        
        const data = await response.json();
        setResidents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching residents:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="qr-code-generator">
      <h2>Individual Residents Data into QR Code</h2>
      <div className="qr-code-list">
        {residents.map((resident) => (
          <div key={resident.id} className="qr-code-item">
            <h4>{`${resident.firstname} ${resident.lastname}`}</h4>
            <QRCodeSVG
              value={JSON.stringify({
                id: resident.id,
                firstname: resident.firstname,
                lastname: resident.lastname,
                birthday: resident.birthday,
                gender: resident.gender,
                address: resident.address,
                email: resident.email,
                phoneNumber: resident.phoneNumber,
                medicalRecord: resident.medicalRecord || {}
              })}
              size={156}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
