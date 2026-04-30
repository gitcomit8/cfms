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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-charcoal/80 border-b border-border transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-grape to-pink flex items-center justify-center text-white shadow-md transform group-hover:rotate-12 transition-all">
              ✨
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-grape to-pink">
              CFMS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/events" className="text-foreground/80 hover:text-grape font-medium transition-colors">
              Events
            </Link>
            <Link to="/schema" className="text-foreground/80 hover:text-grape font-medium transition-colors">
              Schema
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block text-sm">
                  <span className="text-foreground/60">Welcome, </span>
                  <span className="font-semibold text-foreground">{user.firstName}</span>
                </div>

                {isStudent && (
                  <div className="hidden lg:flex items-center gap-4">
                    <Link to="/my-registrations" className="text-sm font-medium text-foreground/80 hover:text-grape transition-colors">My Events</Link>
                    <Link to="/my-teams" className="text-sm font-medium text-foreground/80 hover:text-grape transition-colors">My Teams</Link>
                  </div>
                )}

                {isAdmin && (
                  <div className="hidden lg:flex items-center gap-4">
                    <Link to="/admin/events" className="text-sm font-medium text-foreground/80 hover:text-grape transition-colors">Manage Events</Link>
                    <Link to="/admin/users" className="text-sm font-medium text-foreground/80 hover:text-grape transition-colors">Users</Link>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-full border border-grape/30 text-grape hover:bg-grape hover:text-white transition-all font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/demo-users" className="text-sm font-medium text-foreground/80 hover:text-grape transition-colors">
                  Demo
                </Link>
                <Link to="/auth" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-grape to-pink text-white font-medium shadow-md shadow-pink/20 hover:shadow-lg hover:shadow-pink/40 transform hover:-translate-y-0.5 transition-all">
                  Login
                </Link>
              </>
            )}
            <div className="pl-4 border-l border-border">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
