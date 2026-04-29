import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isJudge, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">✨</div>
          <span className="brand-text">CFMS</span>
        </Link>

        <div className="navbar-links">
          <Link to="/events" className="nav-link">
            Events
          </Link>
          <Link to="/schema" className="nav-link">
            Schema
          </Link>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-welcome">
                <span className="welcome-text">Welcome, <strong>{user.firstName}</strong></span>
              </div>

              {isStudent && (
                <div className="nav-submenu">
                  <Link to="/my-registrations" className="sub-link">
                    My Events
                  </Link>
                  <Link to="/my-teams" className="sub-link">
                    My Teams
                  </Link>
                </div>
              )}

              {isAdmin && (
                <div className="nav-submenu">
                  <Link to="/admin/events" className="sub-link">
                    Events
                  </Link>
                  <Link to="/admin/venues" className="sub-link">
                    Venues
                  </Link>
                  <Link to="/admin/users" className="sub-link">
                    Users
                  </Link>
                </div>
              )}

              {isJudge && (
                <div className="nav-submenu">
                  <Link to="/judge/score" className="sub-link">
                    Score Entry
                  </Link>
                  <Link to="/judge/leaderboard" className="sub-link">
                    Leaderboard
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-outline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/demo-users" className="nav-link">
                Demo
              </Link>
              <Link to="/auth" className="btn btn-primary">
                Login
              </Link>
            </>
          )}

          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
