import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinTeam } from '../../api/teams';

const JoinTeam = () => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return setError('Please enter a join code');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await joinTeam({ joinCode: joinCode.trim().toUpperCase() });
      setSuccess(`Successfully joined "${res.data.team.TeamName}"!`);
      setTimeout(() => navigate('/my-teams'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid join code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal mb-2">Join a Team</h1>
      <p className="text-charcoal/60 text-sm mb-6">Enter the 8-character code your team leader shared with you.</p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green/90 rounded-lg border border-green-200">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-charcoal/20 p-6">
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Join Code</label>
          <input
            type="text"
            placeholder="e.g. ABC1XY23"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-xl text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-grape/80"
          />
        </div>
        <button
          type="submit"
          disabled={loading || joinCode.length !== 8}
          className="w-full bg-grape text-white py-2.5 rounded-lg font-medium hover:bg-grape disabled:opacity-50 transition-colors"
        >
          {loading ? 'Joining...' : 'Join Team'}
        </button>
      </form>
    </div>
  );
};

export default JoinTeam;
