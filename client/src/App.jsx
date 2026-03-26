import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        
        {/* Student Routes */}
        <Route 
          path="/my-registrations" 
          element={
            <ProtectedRoute roles={['student']}>
              <div>My Registrations (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-teams" 
          element={
            <ProtectedRoute roles={['student']}>
              <div>My Teams (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/events" 
          element={
            <ProtectedRoute roles={['admin']}>
              <div>Manage Events (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/venues" 
          element={
            <ProtectedRoute roles={['admin']}>
              <div>Manage Venues (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />

        {/* Judge Routes */}
        <Route 
          path="/judge/score" 
          element={
            <ProtectedRoute roles={['judge']}>
              <div>Score Events (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard/:eventId" 
          element={<div>Leaderboard (Coming Soon)</div>} 
        />

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
