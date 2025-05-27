import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, ArrowLeftToLine, CircleUserRound} from 'lucide-react';

const Navigation = ({ hasPermission, setActiveView, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navRef = useRef(null);
  
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
  
    const handleNavClick = (view) => {
      setActiveView(view);
      setIsMenuOpen(false);
    };
  
    const initiateLogout = () => {
      handleLogout();
    };
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (navRef.current && !navRef.current.contains(event.target) && !event.target.classList.contains('menu-toggle')) {
          setIsMenuOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    return (
      <div className={`app-wrapper ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="HeaderContainer">
          <img src="/logo_brgy.png" alt="Logo" className="logo_brgy" />
             
          <header className="header">
            <button 
              onClick={toggleMenu} 
              className="menu-toggle"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <ArrowLeftToLine size={24} /> : <Menu size={24} />}
            </button>
            <button className='account-btn'>
              <CircleUserRound size={28} />
            </button>
          </header>
        </div>

        <div className="main-content-wrapper">
          <div 
            ref={navRef}
            className={`side-navigation ${isMenuOpen ? 'open' : ''}`}
          >
            <div className="menu-content">
              <h1 className="title">Menu</h1>
      
              <div className="nav-buttons">
                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className="nav-button"
                >
                  Dashboard
                </button>
      
                {hasPermission('view_residents') && (
                  <button 
                    onClick={() => handleNavClick('table')}
                    className="nav-button"
                  >
                    Resident Records 
                  </button>
                )}

{hasPermission('scan_qr') && (
    <button 
        onClick={() => setActiveView('scan_qr')} // Ensure this sets the correct view
        className="nav-button"
    >  Scan QR Code
    </button>
)}
                
                {hasPermission('view_visualization') && (
                  <button 
                    onClick={() => handleNavClick('visualization')}
                    className="nav-button"
                  >
                    Reports & Analytics
                  </button>
                )}
                
                <button onClick={initiateLogout} className="logout-btn">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          </div>

          <div className="content-section">
            {/* Your main page content goes here */}
            <p>Main Content Area</p>
          </div>
        </div>
      </div>
    );
  };

export default Navigation;