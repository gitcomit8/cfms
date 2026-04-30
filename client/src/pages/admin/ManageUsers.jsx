import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, deleteUser, getDashboardStats } from '../../api/admin';
import DataTable from '../../components/DataTable';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([getUsers(), getDashboardStats()]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data);
    } catch {
      setError('Failed to load data');
    }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.ParticipantID === userId ? { ...u, Role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete user "${row.FName} ${row.LName}"? This will remove all their data.`)) return;
    try {
      await deleteUser(row.ParticipantID);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const columns = [
    { key: 'ParticipantID', label: 'ID' },
    { key: 'FName', label: 'First Name' },
    { key: 'LName', label: 'Last Name' },
    { key: 'Email', label: 'Email' },
    { key: 'College', label: 'College' },
    {
      key: 'Role', label: 'Role', noSort: true,
      render: (row) => (
        <select
          value={row.Role}
          onChange={(e) => handleRoleChange(row.ParticipantID, e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-grape/80"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="student">Student</option>
          <option value="judge">Judge</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      key: 'CreatedAt', label: 'Joined',
      render: (r) => r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal mb-6">Manage Users</h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.usersByRole?.reduce((s, r) => s + r.count, 0) || 0 },
            { label: 'Students', value: stats.usersByRole?.find(r => r.Role === 'student')?.count || 0 },
            { label: 'Judges', value: stats.usersByRole?.find(r => r.Role === 'judge')?.count || 0 },
            { label: 'Admins', value: stats.usersByRole?.find(r => r.Role === 'admin')?.count || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-charcoal/20 p-4 text-center">
              <p className="text-2xl font-bold text-charcoal">{value}</p>
              <p className="text-sm text-charcoal/60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <DataTable columns={columns} data={users} onDelete={handleDelete} emptyMessage="No users found." />
    </div>
  );
};

export default ManageUsers;
