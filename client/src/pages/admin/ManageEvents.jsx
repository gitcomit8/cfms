import { useEffect, useState } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/events';
import { getVenues } from '../../api/venues';
import DataTable from '../../components/DataTable';

const EMPTY_FORM = {
  eventName: '', category: 'tech', description: '', venueId: '',
  eventDate: '', startTime: '', endTime: '', maxCapacity: '', teamSize: 1, status: 'upcoming',
};

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [ev, ve] = await Promise.all([getEvents({ limit: 100 }), getVenues()]);
    setEvents(ev.data.events);
    setVenues(ve.data.venues);
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); setError(''); };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      eventName: row.EventName,
      category: row.Category || 'tech',
      description: row.Description || '',
      venueId: row.VenueID || '',
      eventDate: row.EventDate?.split('T')[0] || row.EventDate || '',
      startTime: row.StartTime || '',
      endTime: row.EndTime || '',
      maxCapacity: row.Max_Capacity,
      teamSize: row.TeamSize,
      status: row.Status,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        venueId: form.venueId ? Number(form.venueId) : null,
        maxCapacity: Number(form.maxCapacity),
        teamSize: Number(form.teamSize),
      };
      if (editing) {
        await updateEvent(editing.EventID, payload);
      } else {
        await createEvent(payload);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.EventName}"? This cannot be undone.`)) return;
    try {
      await deleteEvent(row.EventID);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };

  const columns = [
    { key: 'EventID', label: 'ID' },
    { key: 'EventName', label: 'Name' },
    { key: 'Category', label: 'Category' },
    { key: 'EventDate', label: 'Date', render: (r) => r.EventDate?.split('T')[0] || r.EventDate },
    { key: 'VenueName', label: 'Venue' },
    {
      key: 'Current_Capacity', label: 'Registered',
      render: (r) => `${r.Current_Capacity}/${r.Max_Capacity}`,
    },
    {
      key: 'TeamSize', label: 'Format',
      render: (r) => r.TeamSize === 1 ? 'Solo' : `Team of ${r.TeamSize}`,
    },
    {
      key: 'Status', label: 'Status',
      render: (r) => {
        const colors = { upcoming: 'bg-blue-100 text-blue-700', active: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-600' };
        return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[r.Status] || ''}`}>{r.Status}</span>;
      },
      noSort: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + New Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? 'Edit Event' : 'Create Event'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Event Name *</label>
              <input name="eventName" value={form.eventName} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="tech">Tech</option>
                <option value="cultural">Cultural</option>
                <option value="business">Business</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
              <select name="venueId" value={form.venueId} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">No venue</option>
                {venues.map((v) => <option key={v.VenueID} value={v.VenueID}>{v.VenueName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Capacity *</label>
              <input type="number" name="maxCapacity" value={form.maxCapacity} onChange={handleChange} required min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Team Size (1 = solo)</label>
              <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange} min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={events} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No events yet. Create one above." />
    </div>
  );
};

export default ManageEvents;
