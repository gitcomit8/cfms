import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Public pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import DemoUsers from './pages/DemoUsers';
import SchemaVisualizer from './pages/SchemaVisualizer';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';

// Student pages
import MyRegistrations from './pages/student/MyRegistrations';
import MyTeams from './pages/student/MyTeams';
import CreateTeam from './pages/student/CreateTeam';
import JoinTeam from './pages/student/JoinTeam';

// Admin pages
import ManageEvents from './pages/admin/ManageEvents';
import ManageVenues from './pages/admin/ManageVenues';
import ManageUsers from './pages/admin/ManageUsers';

// Judge pages
import ScoreEntry from './pages/judge/ScoreEntry';
import Leaderboard from './pages/judge/Leaderboard';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/demo-users" element={<DemoUsers />} />
        <Route path="/schema" element={<ProtectedRoute><SchemaVisualizer /></ProtectedRoute>} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetail />} />

        {/* Student */}
        <Route path="/my-registrations" element={
          <ProtectedRoute roles={['student']}><MyRegistrations /></ProtectedRoute>
        } />
        <Route path="/my-teams" element={
          <ProtectedRoute roles={['student']}><MyTeams /></ProtectedRoute>
        } />
        <Route path="/create-team" element={
          <ProtectedRoute roles={['student']}><CreateTeam /></ProtectedRoute>
        } />
        <Route path="/join-team" element={
          <ProtectedRoute roles={['student']}><JoinTeam /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/events" element={
          <ProtectedRoute roles={['admin']}><ManageEvents /></ProtectedRoute>
        } />
        <Route path="/admin/venues" element={
          <ProtectedRoute roles={['admin']}><ManageVenues /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>
        } />

        {/* Judge */}
        <Route path="/judge/score" element={
          <ProtectedRoute roles={['judge']}><ScoreEntry /></ProtectedRoute>
        } />
        <Route path="/judge/leaderboard" element={
          <ProtectedRoute roles={['judge', 'admin']}><Leaderboard /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
