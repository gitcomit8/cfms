import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isJudge, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              CFMS
            </Link>
            <div className="ml-8 flex space-x-4">
              <Link 
                to="/events" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Events
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user.firstName}
                </span>
                
                {/* Role-specific navigation */}
                {isStudent && (
                  <div className="flex space-x-2">
                    <Link to="/my-registrations" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm">
                      My Events
                    </Link>
                    <Link to="/my-teams" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm">
                      My Teams
                    </Link>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex space-x-2">
                    <Link to="/admin/events" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm">
                      Events
                    </Link>
                    <Link to="/admin/venues" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm">
                      Venues
                    </Link>
                    <Link to="/admin/users" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm">
                      Users
                    </Link>
                  </div>
                )}

                {isJudge && (
                  <div className="flex space-x-2">
                    <Link to="/judge/score" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm">
                      Score Entry
                    </Link>
                    <Link to="/judge/leaderboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm">
                      Leaderboard
                    </Link>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;