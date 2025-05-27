import React from "react";
import QRCode from "qrcode.react";
import { QrReader } from "react-qr-reader";

export default function QRCodeShare() {
  const url = "http://localhost:3000/";
  const [data, setData] = useState("No result");
  const [setUrl] = useState("http://localhost:3000/");

const handleScan = (result) => {
  if (result) {
    fetch("http://localhost:5001/validate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: result.text }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Validation result:", data))
      .catch((error) => console.error("Error validating QR code:", error));
  }
};

useEffect(() => {
  fetch("http://localhost:5001/get-app-url")
    .then((response) => response.json())
    .then((data) => setUrl(data.url))
    .catch((error) => console.error("Error fetching URL:", error));
}, []);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Scan to Open Web App</h1>
        <QRCode value={url} size={200} className="mx-auto my-4" />
        <p className="text-gray-500 text-sm">Scan this QR code using any device to open the app at:</p>
        <p className="text-blue-600 break-words mt-2">{url}</p>
      </div>

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>
      <div className="w-full max-w-xs">
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              setData(result?.text);
            }
          }}
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%" }}
        />
      </div>
      <p className="mt-4 text-gray-700">Scanned Result: <strong>{data}</strong></p>
    </div>
    </div>
  );
}
