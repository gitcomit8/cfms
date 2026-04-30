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

  const UserCard = ({ user, accentColor }) => (
    <button
      onClick={() => handleQuickLogin(user.email)}
      disabled={loading}
      className={`relative overflow-hidden p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-left group`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${accentColor}/5 rounded-bl-full -z-10 group-hover:bg-${accentColor}/10 transition-colors`} />
      <div className="font-semibold text-foreground text-lg mb-1">{user.name}</div>
      <div className="text-sm text-foreground/70 mb-1">{user.email}</div>
      <div className="text-xs text-foreground/50">{user.college}</div>
      <div className="mt-4 flex">
        <span className={`inline-flex px-3 py-1 bg-${accentColor}/10 text-${accentColor} text-xs font-semibold rounded-full capitalize`}>
          {user.role}
        </span>
      </div>
    </button>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Demo Users</h1>
          <p className="text-lg text-foreground/70 mb-4">
            Skip the registration process and instantly experience the platform from different perspectives.
          </p>
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
            <span className="text-sm text-foreground/70">Universal Password:</span>
            <code className="text-grape font-mono font-bold">password123</code>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-pink/10 border border-pink text-pink px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Students Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue/10 flex items-center justify-center">
              <span className="w-3 h-3 bg-blue rounded-full"></span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Students <span className="text-foreground/40 text-lg ml-2">({studentUsers.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentUsers.map((user) => (
              <UserCard key={user.email} user={user} accentColor="blue" />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-pink/10 flex items-center justify-center">
              <span className="w-3 h-3 bg-pink rounded-full"></span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Administrators <span className="text-foreground/40 text-lg ml-2">({adminUsers.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminUsers.map((user) => (
              <UserCard key={user.email} user={user} accentColor="pink" />
            ))}
          </div>
        </div>

        {/* Judges Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center">
              <span className="w-3 h-3 bg-green rounded-full"></span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Judges <span className="text-foreground/40 text-lg ml-2">({judgeUsers.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {judgeUsers.map((user) => (
              <UserCard key={user.email} user={user} accentColor="green" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoUsers;
