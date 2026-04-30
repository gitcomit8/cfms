import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTeams } from '../../api/teams';

const MyTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTeams()
      .then((res) => setTeams(res.data.teams))
      .catch(() => setError('Failed to load teams'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-charcoal/60">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-charcoal">My Teams</h1>
        <div className="flex gap-3">
          <Link to="/create-team" className="bg-grape text-white px-4 py-2 rounded-lg text-sm hover:bg-grape">
            + Create Team
          </Link>
          <Link to="/join-team" className="border border-grape text-grape px-4 py-2 rounded-lg text-sm hover:bg-blue/20">
            Join Team
          </Link>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      {teams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-charcoal/20">
          <p className="text-charcoal/60 mb-4">You're not in any teams yet.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/create-team" className="bg-grape text-white px-5 py-2 rounded-lg text-sm hover:bg-grape">
              Create a Team
            </Link>
            <Link to="/join-team" className="border border-grape text-grape px-5 py-2 rounded-lg text-sm hover:bg-blue/20">
              Join a Team
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((t) => (
            <Link key={t.TeamID} to={`/teams/${t.TeamID}`}
              className="block bg-white rounded-xl border border-charcoal/20 p-5 hover:border-blue/80 hover:shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-charcoal">{t.TeamName}</h3>
                    {t.IsLeader === 1 && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Leader</span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal/60 mt-1">{t.EventName} · {t.EventDate}</p>
                  <p className="text-sm text-charcoal/60">{t.MemberCount} member{t.MemberCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Join Code</p>
                  <p className="font-mono font-semibold text-grape tracking-widest">{t.JoinCode}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTeams;
