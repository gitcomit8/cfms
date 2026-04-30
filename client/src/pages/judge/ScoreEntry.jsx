import { useEffect, useState } from 'react';
import { getEvents } from '../../api/events';
import { getTeamsByEvent } from '../../api/teams';
import { submitScore, getTeamScores } from '../../api/scores';

const DEFAULT_CRITERIA = [
  { criteriaName: 'Innovation', score: '', weight: 1.5 },
  { criteriaName: 'Technical Execution', score: '', weight: 2.0 },
  { criteriaName: 'Presentation', score: '', weight: 1.0 },
];

const ScoreEntry = () => {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [existingScores, setExistingScores] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEvents({ limit: 100 })
      .then((res) => setEvents(res.data.events.filter((e) => e.TeamSize > 1)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEvent) { setTeams([]); setSelectedTeam(''); return; }
    getTeamsByEvent(selectedEvent)
      .then((res) => setTeams(res.data.teams || []))
      .catch(() => setTeams([]));
    setSelectedTeam('');
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedTeam || !selectedEvent) { setExistingScores([]); return; }
    getTeamScores(selectedTeam, selectedEvent)
      .then((res) => {
        const scores = res.data.scores || [];
        setExistingScores(scores);
        // Pre-fill criteria with existing scores
        if (scores.length > 0) {
          const existing = scores.map((s) => ({
            criteriaName: s.CriteriaName,
            score: s.Score,
            weight: s.Weight,
          }));
          setCriteria(existing);
        } else {
          setCriteria(DEFAULT_CRITERIA);
        }
      })
      .catch(() => setExistingScores([]));
  }, [selectedTeam, selectedEvent]);

  const handleCriteriaChange = (index, field, value) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const addCriteria = () => {
    setCriteria([...criteria, { criteriaName: '', score: '', weight: 1.0 }]);
  };

  const removeCriteria = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedTeam) return setError('Please select an event and team');
    setLoading(true);
    setError('');
    setMessage('');

    try {
      for (const c of criteria) {
        if (!c.criteriaName || c.score === '') continue;
        await submitScore({
          teamId: Number(selectedTeam),
          eventId: Number(selectedEvent),
          criteriaName: c.criteriaName,
          score: Number(c.score),
          weight: Number(c.weight),
        });
      }
      setMessage('Scores submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit scores');
    } finally {
      setLoading(false);
    }
  };

  const selectedTeamName = teams.find((t) => String(t.TeamID) === String(selectedTeam))?.TeamName || '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal mb-6">Score Entry</h1>

      <div className="bg-white rounded-xl border border-charcoal/20 p-6">
        {/* Event + Team Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
            <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grape/80">
              <option value="">Select event...</option>
              {events.map((ev) => (
                <option key={ev.EventID} value={ev.EventID}>{ev.EventName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={!selectedEvent}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grape/80 disabled:bg-charcoal/5">
              <option value="">Select team...</option>
              {teams.map((t) => (
                <option key={t.TeamID} value={t.TeamID}>
                  {t.TeamName} ({t.MemberCount} members)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTeam && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-charcoal">
                Scoring: <span className="text-grape">{selectedTeamName}</span>
                {existingScores.length > 0 && (
                  <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Editing existing scores
                  </span>
                )}
              </h3>
              <button type="button" onClick={addCriteria}
                className="text-sm text-grape hover:text-blue-800 font-medium">
                + Add Criteria
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-charcoal/60 uppercase tracking-wide px-1">
                <span className="col-span-5">Criteria</span>
                <span className="col-span-4">Score (0–100)</span>
                <span className="col-span-2">Weight</span>
              </div>
              {criteria.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    placeholder="Criteria name"
                    value={c.criteriaName}
                    onChange={(e) => handleCriteriaChange(i, 'criteriaName', e.target.value)}
                    className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grape/80"
                  />
                  <input
                    type="number" min="0" max="100" step="0.5" placeholder="Score"
                    value={c.score}
                    onChange={(e) => handleCriteriaChange(i, 'score', e.target.value)}
                    className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grape/80"
                  />
                  <input
                    type="number" min="0.1" step="0.25" placeholder="Weight"
                    value={c.weight}
                    onChange={(e) => handleCriteriaChange(i, 'weight', e.target.value)}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grape/80"
                  />
                  <button type="button" onClick={() => removeCriteria(i)}
                    className="col-span-1 text-gray-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>

            {message && <div className="mb-4 p-3 bg-green-50 text-green/90 rounded-lg border border-green-200 text-sm">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-grape text-white py-2.5 rounded-lg font-medium hover:bg-grape disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Scores'}
            </button>
          </>
        )}

        {!selectedTeam && selectedEvent && teams.length === 0 && (
          <p className="text-center text-charcoal/60 py-6">No teams have registered for this event yet.</p>
        )}
      </div>
    </div>
  );
};

export default ScoreEntry;
