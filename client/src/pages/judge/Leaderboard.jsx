import { useEffect, useState } from 'react';
import { getEvents } from '../../api/events';
import { getLeaderboard } from '../../api/scores';

const medals = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventName, setEventName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents({ limit: 100 }).then((res) => setEvents(res.data.events)).catch(() => {});
  }, []);

  const fetchLeaderboard = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getLeaderboard(eventId);
      setLeaderboard(res.data.leaderboard || []);
      setEventName(res.data.event?.EventName || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
    fetchLeaderboard(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Leaderboard</h1>
          <p className="text-sm text-charcoal/60 mt-1">Results from GenerateLeaderboard() stored procedure</p>
        </div>
        {selectedEvent && (
          <button onClick={() => fetchLeaderboard(selectedEvent)}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-charcoal/5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
        <select value={selectedEvent} onChange={handleEventChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grape/80 w-72">
          <option value="">Choose an event...</option>
          {events.map((ev) => (
            <option key={ev.EventID} value={ev.EventID}>{ev.EventName}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-12 text-charcoal/60">Loading leaderboard...</div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
      )}

      {!loading && selectedEvent && leaderboard.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-xl border border-charcoal/20">
          <p className="text-charcoal/60">No scores submitted for this event yet.</p>
        </div>
      )}

      {!loading && leaderboard.length > 0 && (
        <div className="bg-white rounded-xl border border-charcoal/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal/10 bg-charcoal/5">
            <h2 className="font-semibold text-charcoal">{eventName}</h2>
            <p className="text-xs text-charcoal/60">{leaderboard.length} team{leaderboard.length !== 1 ? 's' : ''} ranked · weighted average scoring</p>
          </div>
          <table className="w-full">
            <thead className="bg-charcoal/5 border-b border-charcoal/10">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-charcoal/60 uppercase">Rank</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-charcoal/60 uppercase">Team</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-charcoal/60 uppercase">Weighted Avg</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-charcoal/60 uppercase">Judges</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-charcoal/60 uppercase">Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {leaderboard.map((row, i) => (
                <tr key={row.TeamID} className={i === 0 ? 'bg-amber-50' : 'hover:bg-charcoal/5'}>
                  <td className="px-5 py-4 text-lg">
                    {i < 3 ? medals[i] : <span className="text-sm font-semibold text-charcoal/60">#{i + 1}</span>}
                  </td>
                  <td className="px-5 py-4 font-medium text-charcoal">{row.TeamName}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-lg font-bold font-mono ${i === 0 ? 'text-amber-600' : 'text-grape'}`}>
                      {Number(row.WeightedAvg).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-charcoal/80">{row.JudgeCount}</td>
                  <td className="px-5 py-4 text-right text-charcoal/80">{row.CriteriaCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
