import React from 'react';
import { PlusCircle } from 'lucide-react';

const ResidentRecords = ({ 
    residents = [], 
    filteredresidents = [], 
    currentPage, 
    itemsPerPage, 
    searchTerm, 
    setSearchTerm, 
    handleSearch, 
    setFilteredresidents, 
    setCurrentPage, 
    handleOpenAddModal, 
    handleViewMore, 
    handleEdit,
    handleAddSubmit, //gidungag nako kay di ko kaadd
    handleDelete,
    showDeleteModal,
    cancelDelete,
    confirmDelete
  }) => {
  return (
    <div>
      <h2>Resident List</h2>
      
      <div className="table-top">
        
        <div className="search-area">
          <input  
            type="text"
            placeholder="Search by Firstname, Lastname, or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
          {filteredresidents.length > 0 && (
            <button
              onClick={() => {
                setFilteredresidents([]);
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="reset-btn"
            >
              Reset
            </button>
          )}
        </div>

        <button className="Add-main-btn" onClick={handleOpenAddModal}>
          <PlusCircle size={20} style={{ verticalAlign: 'middle' }} />
          <span style={{ lineHeight: '1' }}>Add New Resident</span>
        </button>
      </div>
      
      <table className="resident-Table" border="1" align="center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Birthday</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(filteredresidents.length > 0 ? filteredresidents : residents).length > 0 ? (
            (filteredresidents.length > 0 ? filteredresidents : residents)
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )
              .map((resident) => (
                <tr key={resident.id}>
                  <td>{resident.id}</td>
                  <td>{resident.lastname} {resident.firstname}</td>
                  <td>{resident.birthday}</td>
                  <td>{resident.gender}</td>
                  <td>{resident.age}</td>
                  <td>{resident.email}</td>
                  <td>{resident.pnumber}</td>
                  <td>
                    <div className="tb-buttons">
                      <button className="View-button" onClick={() => handleViewMore(resident)}>View more</button>
                      <button
                        className="Edit-button"
                        onClick={() => handleEdit(resident)}
                      >
                        Edit
                      </button>
                      <button
                        className="Delete-button"
                        onClick={() => handleDelete(resident.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: "center", padding: "10px", color: "#888" }}>
                No residents listed at the moment
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showDeleteModal && (
        <div className="modal-overlay-delete">
          <div className="modal-card-delete">
            <h3>Are you sure you want to Delete this resident?</h3>
            <div className="modal-actions-del">
              <button onClick={cancelDelete} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirm-btn">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        {/* Left Arrow (Previous Page) */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{
            margin: '0 5px',
            backgroundColor: 'transparent',
            color: currentPage === 1 ? '#ccc' : '#841bc8', 
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            border: 'none',
            outline: 'none'
          }}
        >
          ◀
        </button>

        {Array.from({
          length: Math.ceil(
            (filteredresidents.length > 0 ? filteredresidents : residents).length / itemsPerPage
          )
        }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              margin: '0 3px',
              width: '30px',
              height: '22px',
              borderRadius: '50%', // Creates a circular shape
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px', // Smaller font size
              backgroundColor: currentPage === i + 1 ? '#841bc8' : 'white', 
              color: currentPage === i + 1 ? 'white' : 'black',
              border: '1px solid #841bc8', // Adds a border to maintain visibility
              cursor: 'pointer', // Indicates the button is clickable
              transition: 'background-color 0.3s ease', // Smooth color transition
              padding: 0, // Remove any default padding
            }}
          >
            {i + 1}
          </button>
        ))}

        {/* Right Arrow (Next Page) */}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(
            (filteredresidents.length > 0 ? filteredresidents : residents).length / itemsPerPage
          )))}
          disabled={currentPage === Math.ceil(
            (filteredresidents.length > 0 ? filteredresidents : residents).length / itemsPerPage
          )}
          style={{
            margin: '0 5px',
            backgroundColor: 'transparent',
            color: currentPage === Math.ceil(
              (filteredresidents.length > 0 ? filteredresidents : residents).length / itemsPerPage
            ) ? '#ccc' : '#841bc8',
            cursor: currentPage === Math.ceil(
              (filteredresidents.length > 0 ? filteredresidents : residents).length / itemsPerPage
            ) ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            border: 'none', 
            outline: 'none'
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default ResidentRecords;