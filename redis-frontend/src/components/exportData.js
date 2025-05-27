import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import './exportData.css';
import { useNavigate } from 'react-router-dom';

// Overview:
// - fetchResidents: Fetches resident records from backend, with error handling.
// - handleExport: Loads data for export, handles errors, and sets state.
// - CSVLink: Exports the loaded data as CSV when clicked.

function ExportData() {
    const [records, setRecords] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch resident records from backend API
    const fetchResidents = async () => {
        try {
            const response = await fetch('http://localhost:5000/residents'); // Update this URL to match your backend endpoint
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data; // Should be an array of resident objects
        } catch (error) {
            throw error;
        }
    };

    // Handles export button click: fetches data and handles errors
    const handleExport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchResidents();
            setRecords(data);
        } catch (err) {
            setError('Failed to load resident records.');
        } finally {
            setLoading(false);
        }
    };

    // Optionally, navigate after export (not used here, but demonstrates useNavigate)
    // const handleAfterExport = () => {
    //     navigate('/somewhere');
    // };

    return (
        <div className="export-data-actions">
            <button
                className="export-data-btn"
                onClick={handleExport}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Load Residents'}
            </button>
            {error && <div className="export-data-error">{error}</div>}
            {records.length > 0 && (
                <CSVLink
                    data={records}
                    filename="residents.csv"
                    className="export-data-link"
                >
                    Export Residents to CSV
                </CSVLink>
            )}
        </div>
    );
}

export default ExportData;