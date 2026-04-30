import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations, cancelRegistration } from '../../api/registrations';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await getMyRegistrations();
      setRegistrations(res.data.registrations);
    } catch {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (eventId, eventName) => {
    if (!window.confirm(`Cancel registration for "${eventName}"?`)) return;
    try {
      await cancelRegistration(eventId);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel registration');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-charcoal/60">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-charcoal">My Registrations</h1>
        <Link to="/events" className="text-grape text-sm hover:text-blue-800">Browse Events →</Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
      )}

      {registrations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-charcoal/20">
          <p className="text-charcoal/60 mb-4">You haven't registered for any events yet.</p>
          <Link to="/events" className="bg-grape text-white px-5 py-2 rounded-lg text-sm hover:bg-grape">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div key={`${r.ParticipantID}-${r.EventID}`}
              className="bg-white rounded-xl border border-charcoal/20 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-charcoal">{r.EventName}</h3>
                <p className="text-sm text-charcoal/60 mt-0.5">
                  {r.EventDate} · {r.Category}
                  {r.VenueName && ` · ${r.VenueName}`}
                  {r.TeamName && <span className="ml-2 text-grape">Team: {r.TeamName}</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  r.Status === 'confirmed' ? 'bg-green/20 text-green/90' : 'bg-charcoal/10 text-charcoal/60'
                }`}>
                  {r.Status}
                </span>
                {r.Status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(r.EventID, r.EventName)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
