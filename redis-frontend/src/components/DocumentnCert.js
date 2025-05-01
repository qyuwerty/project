import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import "./Docu.css";


const DocumentnCert = ({ residents = [] }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add these new states for document preview
  const [previewContent, setPreviewContent] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);

  

   // Fetch documents when component mounts
   useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      console.log('Attempting to fetch documents from API...');
      try {
        // Use the full URL to be explicit
        const response = await fetch('http://localhost:5000/documents', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'  // Add this if you're using cookies/sessions
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully fetched documents:', data);
          setDocuments(data);
          setIsLoading(false);
          return;
        } else {
          console.error('API response not OK:', response.status, response.statusText);
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
      } catch (apiError) {
        console.error('API fetch error:', apiError);
        // Fallback to local storage
        const savedDocs = JSON.parse(localStorage.getItem('barangayDocs') || '[]');
        setDocuments(savedDocs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert('Failed to load documents. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Form state
  const [newDocument, setNewDocument] = useState({
    type: '',
    residentId: '',
    firstname: '',
    lastname: '',
    purpose: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddDocument = async (e) => {
    e.preventDefault();
    
    const { type, firstname, lastname, purpose } = newDocument;
    
    if (!type || !firstname || !lastname || !purpose) {
      alert("Please fill in all fields.");
      return;
    }
    
    try {
      // Find the resident
      let selectedResident = residents.find(r => 
        r.firstname.trim().toLowerCase() === firstname.trim().toLowerCase() && 
        r.lastname.trim().toLowerCase() === lastname.trim().toLowerCase()
      );
      
      if (!selectedResident) {
        alert(`Resident not found: ${lastname}, ${firstname}. Please check spelling and try again.`);
        return;
      }
      
      const fullName = `${selectedResident.lastname}, ${selectedResident.firstname}`;
      
      // Create document object
      const newDocObj = {
        id: documents.length > 0 ? Math.max(...documents.map(d => parseInt(d.id) || 0)) + 1 : 1,
        type,
        residentId: selectedResident.id,
        residentName: fullName,
        dateIssued: new Date().toISOString().split('T')[0],
        purpose
      };
      
      console.log("Sending document:", newDocObj);
      
      // Update local state
      const updatedDocuments = [...documents, newDocObj];
      setDocuments(updatedDocuments);
      
      // Try saving to API
      try {
        const response = await fetch('http://localhost:5000/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newDocObj),
          credentials: 'include'
        });
        
        // Get the full response text for debugging
        let responseText;
        try {
          responseText = await response.text();
          console.log("Response text:", responseText);
        } catch (textError) {
          console.error("Could not get response text:", textError);
        }
        
        if (response.ok) {
          console.log('Successfully saved to Redis database!');
          alert('Document created successfully and saved to database!');
          fetchDocuments(); // Refresh the document list
        } else {
          console.error('Failed to save to Redis. Status:', response.status);
          console.error('Response text:', responseText);
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (apiError) {
        console.error('Error saving to API:', apiError);
        console.error('Request body was:', JSON.stringify(newDocObj));
        
        // Fallback to localStorage
        localStorage.setItem('barangayDocs', JSON.stringify(updatedDocuments));
        alert(`Warning: Document saved locally only. API error: ${apiError.message}`);
      }
      
      // Reset form
      setIsModalOpen(false);
      setNewDocument({
        type: '',
        residentId: '',
        firstname: '',
        lastname: '',
        purpose: ''
      });
      
    } catch (error) {
      console.error('Error in document processing:', error);
      alert('An error occurred. Your document may not have been saved completely.');
    }
  };
  // Modified function to create document content and open preview modal
    const generateDocumentPreview = (documentData, resident) => {
    let documentContent = "";
    const fullName = `${resident.lastname} ${resident.firstname}`;
    const currentDate = new Date().toLocaleDateString();

    if (documentData.type === "Barangay Clearance") {
      documentContent = `
        <h2 style="text-align: center;">BARANGAY CLEARANCE</h2>
        <p style="text-align: center;">Republic of the Philippines</p>
        <p style="text-align: center;">CITY OF ILIGAN CITY</p>
        <p style="text-align: center;">BARANGAY UBALDO DE LAYA</p>
        <hr>
        <p>This is to certify that <strong>${fullName}</strong>, ${resident.age} years old, ${resident.gender}, 
        with residence at Purok ${resident.purok}, House No. ${resident.houseNumber || 'N/A'}, 
        has been residing in this Barangay for ${resident.yearsOfResidency || '0'} years.</p>
        <p>Based on records filed in this office, he/she has no derogatory record and is a person of good moral character.</p>
        <p>This CERTIFICATION is issued upon request of the above named person for <strong>${documentData.purpose}</strong> purposes.</p>
        <p>Issued this ${currentDate} at the Barangay Hall.</p>
        <div style="margin-top: 80px; text-align: center;">
          <p>________________________</p>
          <p><strong>BARANGAY CAPTAIN</strong></p>
        </div>
      `;
    } else if (documentData.type === "Residency Certification") {
      documentContent = `
        <h2 style="text-align: center;">CERTIFICATE OF RESIDENCY</h2>
        <p style="text-align: center;">Republic of the Philippines</p>
        <p style="text-align: center;">CITY OF ILIGAN CITY</p>
        <p style="text-align: center;">BARANGAY UBALDO DE LAYA</p>
        <hr>
        <p>This is to certify that <strong>${fullName}</strong>, ${resident.age} years old, ${resident.civilStatus || 'Single'}, 
        is a bonafide resident of Purok ${resident.purok}, House No. ${resident.houseNumber || 'N/A'}, 
        and has been continuously residing in this Barangay for ${resident.yearsOfResidency || '0'} years.</p>
        <p>This certification is being issued upon the request of the above-named person for <strong>${documentData.purpose}</strong>.</p>
        <p>Issued this ${currentDate} at the Barangay Hall.</p>
        <div style="margin-top: 80px; text-align: center;">
          <p>________________________</p>
          <p><strong>BARANGAY CAPTAIN</strong></p>
        </div>
      `;
    } else if (documentData.type === "Indigency Certificate") {
      documentContent = `
        <h2 style="text-align: center;">CERTIFICATE OF INDIGENCY</h2>
        <p style="text-align: center;">Republic of the Philippines</p>
        <p style="text-align: center;">CITY OF ILIGAN CITY</p>
        <p style="text-align: center;">BARANGAY UBALDO DE LAYA</p>
        <hr>
        <p>This is to certify that <strong>${fullName}</strong>, ${resident.age} years old, ${resident.gender},
        residing at Purok ${resident.purok}, House No. ${resident.houseNumber || 'N/A'}, with occupation as ${resident.occupation || "none"},
        is an INDIGENT resident of this Barangay with a monthly income of ${resident.monthlyIncomeRange || 'undisclosed'}.</p>
        <p>This certification is being issued upon the request of the above-named person for <strong>${documentData.purpose}</strong>.</p>
        <p>Issued this ${currentDate} at the Barangay Hall.</p>
        <div style="margin-top: 80px; text-align: center;">
          <p>________________________</p>
          <p><strong>BARANGAY CAPTAIN</strong></p>
        </div>
      `;
    }

    // Set the preview content and current document
    setPreviewContent(documentContent);
    setCurrentDocument(documentData);
    setIsPreviewModalOpen(true);
  };

// Function to download as PDF
const handlePrint = () => {
  // Get document title for filename
  const documentTitle = currentDocument?.type?.replace(/\s+/g, '_') || 'Document';
  const residentName = currentDocument?.residentName?.replace(/\s+/g, '_') || 'Resident';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${documentTitle}_${residentName}_${timestamp}`;
  
  // Create a hidden iframe to capture the document content
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '-10000px';
  document.body.appendChild(iframe);
  
  // Write content to iframe with improved styling for PDF
  iframe.contentDocument.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${currentDocument?.type || "Document"}</title>
      <meta charset="UTF-8">
      <style>
        @page {
          size: 8.5in 11in;
          margin: 0.5in;
          color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        body {
          background-color: #FF6666;;
          font-family: Arial, sans-serif;
          line-height: 1.5;
          color: #000;
          margin: 1.5;
          margin-top:0.5in;
          padding: 0;
          position: relative;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .document-container {
          padding: 20px;
          max-width: 7.5in;
          margin: 0 auto;
          position: relative;
        }
        h2 {
          text-align: center;
          margin-bottom: 5px;
          font-size: 18pt;
          color:#003366;
        }

        }
        p {
          font-size: 12pt;
          margin: 10px 0;
          color: #000000;
        }
        hr {
          margin: 20px 0;
          margin-bottom: 50px;
          border: none;
          border-top: 2px solid #660000;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
          height: 80px;
        }
        .header p {
          color: #444444;
        }
        .signature {
          margin-top: 80px;
          text-align: center;
        }
        .logo-left {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 105px;
          height: auto;
        }
        .logo-right {
          position: absolute;
          top: 20px;
          right: 30px;
          width: 100px;
          height: auto;
        }
        .red-line {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 20px; /* Adjust thickness */
           background: linear-gradient(to right,rgb(199, 7, 7),rgb(178, 114, 18)); 
          pointer-events: none;
          z-index: 100;
        }
          .red-line-bottom {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20px; /* Adjust thickness */
          background: linear-gradient(to right,rgb(199, 7, 7),rgb(178, 114, 18));  
          pointer-events: none;
          z-index: 100;
        }

        strong {
          color: #003366;
          font-weight: bold;
        }
        .footer {
          position: fixed;
          bottom: 50px;
          width: 100%;
          text-align: center;
          font-size: 10pt;
          color: #666666;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 72pt;
          color: rgba(200, 200, 200, 0.15);
          pointer-events: none;
          z-index: 10;
        }

       
        }
      </style>
    </head>
    <body>
      <div class="red-line"></div>
      <div class="document-container">
        <div class="header">
          <img src="${window.location.origin}/logo_brgy.png" class="logo-left" alt="Logo" />
          <img src="${window.location.origin}/logo.png" class="logo-right" alt="Barangay Logo" />
        </div>
        ${previewContent}
        <div class="footer">
          Barangay Ubaldo De Laya, Iligan City • ${new Date().getFullYear()}
        </div>
        <div class="red-line-bottom"></div>
      </div>
    </body>
    </html>
  `);
    
    // Prompt user to save as PDF after iframe loads
    setTimeout(() => {
      try {
        // Set filename in print dialog (works in some browsers)
        const style = document.createElement('style');
        style.textContent = `@page { size: auto; margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }`;
        iframe.contentDocument.head.appendChild(style);
        
        // Show print dialog
        iframe.contentWindow.document.title = filename;
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error("Error during PDF generation:", error);
        alert("There was an error generating the PDF. Please try again.");
        document.body.removeChild(iframe);
      }
    }, 500);
  };

  return (
    <div>
      <h2>Documents & Certifications</h2>
      
     
      <div className="table-top-docu">
        <button 
          className="Add-main-btn" 
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={20} style={{ verticalAlign: 'middle' }} />
          <span>Generate New Document</span>
        </button>
      </div>
  
      {isLoading ? (
        <p>Loading documents...</p>
      ) : (
        <>
          <table className="documents-table" border="1">
  <thead>
    <tr>
      <th>ID</th>
      <th>Document Type</th>
      <th>Resident Name</th>
      <th>Date Issued</th>
      <th>Purpose</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {documents.length > 0 ? (
      documents.map((doc) => (
        <tr key={doc.id}>
          <td>{doc.id}</td>
          <td>{doc.type}</td>
          <td>{doc.residentName}</td>
          <td>{doc.dateIssued}</td>
          <td>{doc.purpose}</td>
          <td>
            <div className="tb-buttons">
              <button 
                className="View-button"
                onClick={() => {
                  const resident = residents.find(r => r.id === doc.residentId);
                  if (resident) {
                    generateDocumentPreview(doc, resident);
                  } else {
                    alert("Resident data not found");
                  }
                }}
              >
                View
              </button>
            </div>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
          No documents found. Generate a new document to get started.
        </td>
      </tr>
    )}
  </tbody>
</table>
          
        </>
      )}
  
      {/* Form Modal */}
      {isModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>Generate New Document</h3>
      <form onSubmit={handleAddDocument}>
        <div>
          <label>Document Type</label>
          <select
            value={newDocument.type}
            onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
            required
          >
            <option value="">Select Document Type</option>
            <option value="Barangay Clearance">Barangay Clearance</option>
            <option value="Residency Certification">Residency Certification</option>
            <option value="Indigency Certificate">Indigency Certificate</option>
          </select>
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            list="lastNameList"
            value={newDocument.lastname}
            onChange={(e) => setNewDocument({ ...newDocument, lastname: e.target.value })}
            placeholder="Type last name"
            required
          />
          <datalist id="lastNameList">
            {residents.map(resident => (
              <option key={resident.id} value={resident.lastname} />
            ))}
          </datalist>
        </div>
        <div>
          <label>First Name</label>
          <input
            type="text"
            list="firstNameList"
            value={newDocument.firstname}
            onChange={(e) => setNewDocument({ ...newDocument, firstname: e.target.value })}
            placeholder="Type first name"
            required
          />
          <datalist id="firstNameList">
            {residents
              .filter(r => r.lastname === newDocument.lastname)
              .map(resident => (
                <option key={resident.id} value={resident.firstname} />
              ))}
          </datalist>
        </div>
        <div>
          <label>Purpose</label>
          <input
            type="text"
            value={newDocument.purpose}
            onChange={(e) => setNewDocument({...newDocument, purpose: e.target.value})}
            required
          />
        </div>
        <div className="modal-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button type="submit" className="confirm-btn">
            Generate Document
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      {/* Document Preview Modal */}
      {isPreviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card preview-modal">
            <h3>{currentDocument?.type || "Document Preview"}</h3>
            <div 
              className="document-preview" 
              style={{ 
                padding: "20px", 
                border: "1px solid #ddd", 
                backgroundColor: "white", 
                maxHeight: "60vh", 
                overflowY: "auto" 
              }}
              dangerouslySetInnerHTML={{ __html: previewContent }}
            ></div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="download-btn"
                onClick={handlePrint}
                style={{ backgroundColor: "#4CAF50", color: "white" }}
              >
                Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentnCert;