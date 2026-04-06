import { useEffect, useState } from 'react';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../../api/venues';
import DataTable from '../../components/DataTable';

const EMPTY_FORM = { venueName: '', street: '', city: '', state: '', zip: '', capacity: '' };

const ManageVenues = () => {
  const [venues, setVenues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => getVenues().then((res) => setVenues(res.data.venues));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); setError(''); };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      venueName: row.VenueName,
      street: row.Street || '',
      city: row.City || '',
      state: row.State || '',
      zip: row.ZIP || '',
      capacity: row.Capacity || '',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      if (editing) {
        await updateVenue(editing.VenueID, payload);
      } else {
        await createVenue(payload);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save venue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.VenueName}"?`)) return;
    try {
      await deleteVenue(row.VenueID);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete venue');
    }
  };

  const columns = [
    { key: 'VenueID', label: 'ID' },
    { key: 'VenueName', label: 'Name' },
    { key: 'City', label: 'City' },
    { key: 'State', label: 'State' },
    { key: 'Capacity', label: 'Capacity' },
    {
      key: 'address', label: 'Address', noSort: true,
      render: (r) => r.Street ? `${r.Street}, ${r.City}` : '—',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Venues</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + New Venue
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? 'Edit Venue' : 'Create Venue'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Venue Name *</label>
              <input name="venueName" value={form.venueName} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Street</label>
              <input name="street" value={form.street} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input name="city" value={form.city} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <input name="state" value={form.state} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ZIP</label>
              <input name="zip" value={form.zip} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : editing ? 'Update Venue' : 'Create Venue'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={venues} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No venues yet." />
    </div>
  );
};

export default ManageVenues;
