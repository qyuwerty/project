// components/ResidentQRCode.js
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const ResidentQRCode = ({ resident }) => {
  const qrValue = JSON.stringify({
    url: 'http://localhost:3000/',
    ...resident,
  });

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl mb-4">Resident QR Code</h2>
      <QRCodeCanvas
        value={qrValue}
        size={256}
        level="H"
        includeMargin={true}
      />
      <p className="mt-4 text-sm text-gray-600">Data embedded in the QR code.</p>
    </div>
  );
};

export default ResidentQRCode;
