import React, { useState, useEffect } from 'react';
import './Event.css';

const CommunityEvents = ({ residents = [] }) => {
  // Event categories
  const eventCategories = [
    'Health & Wellness',
    'Education',
    'Environmental',
    'Cultural & Arts',
    'Sports & Recreation',
    'Community Service',
    'Safety & Security',
    'Fundraising',
    'Senior Citizens',
    'Youth Development'
  ];

  // State for events
  const [events, setEvents] = useState([]);
  // State for the current event being created/edited
  const [currentEvent, setCurrentEvent] = useState({
    id: null,
    name: '',
    category: '',
    date: '',
    description: '',
    volunteers: []
  });
  // State for form mode (create or edit)
  const [isEditing, setIsEditing] = useState(false);
  // State for volunteer search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Filter residents based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = residents.filter(resident => 
      `${resident.firstname} ${resident.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm, residents]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent({
      ...currentEvent,
      [name]: value
    });
  };

  // Add resident as volunteer
  const addVolunteer = (resident) => {
    if (!currentEvent.volunteers.some(vol => vol.id === resident.id)) {
      setCurrentEvent({
        ...currentEvent,
        volunteers: [...currentEvent.volunteers, {
          id: resident.id || `${resident.firstname}-${resident.lastname}-${resident.birthday}`,
          name: `${resident.firstname} ${resident.lastname}`,
          contact: resident.phoneNumber || 'No contact provided',
          email: resident.email || 'No email provided'
        }]
      });
    }
    setSearchTerm('');
  };

  // Remove volunteer
  const removeVolunteer = (volunteerId) => {
    setCurrentEvent({
      ...currentEvent,
      volunteers: currentEvent.volunteers.filter(vol => vol.id !== volunteerId)
    });
  };

  // Save event
  const saveEvent = (e) => {
    e.preventDefault();
    
    if (!currentEvent.name || !currentEvent.category || !currentEvent.date) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (isEditing) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === currentEvent.id ? currentEvent : event
      ));
    } else {
      // Create new event with a unique ID
      const newEvent = {
        ...currentEvent,
        id: Date.now().toString()
      };
      setEvents([...events, newEvent]);
    }
    
    // Reset form
    resetForm();
  };

  // Start editing an event
  const editEvent = (event) => {
    setCurrentEvent(event);
    setIsEditing(true);
  };

  // Delete an event
  const deleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setCurrentEvent({
      id: null,
      name: '',
      category: '',
      date: '',
      description: '',
      volunteers: []
    });
    setIsEditing(false);
    setSearchTerm('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="community-events-container">
      <h2>Community Events</h2>
      
      {/* Event Form */}
      <div className="event-form-container">
        <h3>{isEditing ? 'Edit Event' : 'Create New Event'}</h3>
        <form onSubmit={saveEvent} className="event-form">
          <div className="form-group">
            <label htmlFor="name">Event Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentEvent.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category*</label>
            <select
              id="category"
              name="category"
              value={currentEvent.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {eventCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date*</label>
            <input
              type="date"
              id="date"
              name="date"
              value={currentEvent.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={currentEvent.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              rows="4"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Volunteers</label>
            <div className="volunteer-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search residents to add as volunteers..."
              />
              
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map(resident => (
                    <li 
                      key={`${resident.firstname}-${resident.lastname}-${resident.birthday}`}
                      onClick={() => addVolunteer(resident)}
                    >
                      {resident.firstname} {resident.lastname}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {currentEvent.volunteers.length > 0 && (
              <div className="volunteer-list">
                <h4>Selected Volunteers ({currentEvent.volunteers.length})</h4>
                <ul>
                  {currentEvent.volunteers.map(volunteer => (
                    <li key={volunteer.id} className="volunteer-item">
                      <div className="volunteer-info">
                        <span className="volunteer-name">{volunteer.name}</span>
                        <span className="volunteer-contact">{volunteer.contact}</span>
                        <span className="volunteer-email">{volunteer.email}</span>
                      </div>
                      <button 
                        type="button" 
                        className="remove-volunteer"
                        onClick={() => removeVolunteer(volunteer.id)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {isEditing ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      {/* Events List */}
      <div className="events-list">
        <h3>Upcoming Events ({events.length})</h3>
        
        {events.length === 0 ? (
          <div className="no-events">No events scheduled. Create a new event to get started!</div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <span className="event-category">{event.category}</span>
                  <div className="event-actions">
                    <button onClick={() => editEvent(event)} className="btn-edit">Edit</button>
                    <button onClick={() => deleteEvent(event.id)} className="btn-delete">Delete</button>
                  </div>
                </div>
                
                <h4 className="event-name">{event.name}</h4>
                <div className="event-date">{formatDate(event.date)}</div>
                
                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
                
                <div className="event-volunteers">
                  <h5>Volunteers ({event.volunteers.length})</h5>
                  {event.volunteers.length > 0 ? (
                    <ul>
                      {event.volunteers.map(volunteer => (
                        <li key={volunteer.id}>
                          <strong>{volunteer.name}</strong>
                          <div className="volunteer-contact-info">
                            <span>{volunteer.contact}</span>
                            <span>{volunteer.email}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-volunteers">No volunteers assigned</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityEvents;