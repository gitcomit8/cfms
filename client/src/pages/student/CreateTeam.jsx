import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { createTeam } from '../../api/teams';
import { getEvents } from '../../api/events';

const CreateTeam = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    eventId: searchParams.get('eventId') || '',
    teamName: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEvents({ limit: 100 })
      .then((res) => setEvents(res.data.events.filter((e) => e.TeamSize > 1)))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventId || !form.teamName.trim()) {
      return setError('Please select an event and enter a team name');
    }
    setLoading(true);
    setError('');
    try {
      const res = await createTeam({ eventId: Number(form.eventId), teamName: form.teamName.trim() });
      setResult(res.data.team);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Created!</h2>
          <p className="text-gray-500 mb-6">Share this join code with your teammates:</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-4xl font-mono font-bold text-blue-600 tracking-widest">{result.JoinCode}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">Team: <strong>{result.TeamName}</strong></p>
          <div className="flex gap-3 justify-center">
            <Link to="/my-teams" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
              View My Teams
            </Link>
            <button onClick={() => setResult(null)} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Team</h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
          <select
            value={form.eventId}
            onChange={(e) => setForm({ ...form, eventId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a team event...</option>
            {events.map((ev) => (
              <option key={ev.EventID} value={ev.EventID}>
                {ev.EventName} (Team of {ev.TeamSize})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
          <input
            type="text"
            placeholder="Enter your team name"
            value={form.teamName}
            onChange={(e) => setForm({ ...form, teamName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
};

export default CreateTeam;
