import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DemoUsers = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoUsers = [
    // Students
    { email: 'pratik@college.edu', name: 'Pratik Raj', role: 'student', college: 'ABC College' },
    { email: 'arjun@college.edu', name: 'Arjun Sharma', role: 'student', college: 'ABC College' },
    { email: 'priya@college.edu', name: 'Priya Singh', role: 'student', college: 'ABC College' },
    { email: 'rahul@college.edu', name: 'Rahul Kumar', role: 'student', college: 'XYZ University' },
    { email: 'sneha@college.edu', name: 'Sneha Patel', role: 'student', college: 'DEF Institute' },
    { email: 'rajesh@college.edu', name: 'Rajesh Reddy', role: 'student', college: 'Tech Institute' },
    { email: 'divya@college.edu', name: 'Divya Sharma', role: 'student', college: 'Tech Institute' },
    { email: 'vikram@college.edu', name: 'Vikram Singh', role: 'student', college: 'Science College' },
    { email: 'pooja@college.edu', name: 'Pooja Gupta', role: 'student', college: 'Science College' },
    { email: 'anuj@college.edu', name: 'Anuj Verma', role: 'student', college: 'ABC College' },
    // Admin
    { email: 'ayush@college.edu', name: 'Ayush Dwivedi', role: 'admin', college: 'ABC College' },
    { email: 'aditya@college.edu', name: 'Aditya Rao', role: 'admin', college: 'Engineering Dept' },
    // Judges
    { email: 'ayaan@college.edu', name: 'Ayaan Mirza', role: 'judge', college: 'ABC College' },
    { email: 'meera@college.edu', name: 'Prof. Meera Nair', role: 'judge', college: 'ABC College' },
    { email: 'subodh@college.edu', name: 'Prof. Subodh Mishra', role: 'judge', college: 'Science College' },
  ];

  const handleQuickLogin = async (email) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(email, 'password123');
      if (result.success) {
        navigate('/');
      } else {
        setError(`Login failed: ${result.error}`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const studentUsers = demoUsers.filter(u => u.role === 'student');
  const adminUsers = demoUsers.filter(u => u.role === 'admin');
  const judgeUsers = demoUsers.filter(u => u.role === 'judge');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Demo Users</h1>
          <p className="text-lg text-gray-600">
            Click any button below to instantly login with a demo user account.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Password for all accounts: <code className="bg-gray-200 px-2 py-1 rounded">password123</code>
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Students Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
            Students ({studentUsers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleQuickLogin(user.email)}
                disabled={loading}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-400 transition-all disabled:opacity-50 text-left"
              >
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">{user.college}</div>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {user.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
            Admins ({adminUsers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleQuickLogin(user.email)}
                disabled={loading}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-purple-400 transition-all disabled:opacity-50 text-left"
              >
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">{user.college}</div>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {user.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Judges Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            Judges ({judgeUsers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {judgeUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleQuickLogin(user.email)}
                disabled={loading}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-green-400 transition-all disabled:opacity-50 text-left"
              >
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">{user.college}</div>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {user.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Demo Accounts</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✓ All demo accounts use the password: <code className="bg-white px-2 py-1 rounded">password123</code></li>
            <li>✓ Students can create and join teams, register for events</li>
            <li>✓ Admins can manage venues, events, and users</li>
            <li>✓ Judges can score teams and view leaderboards</li>
            <li>✓ Each account has pre-populated with sample data for testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemoUsers;
