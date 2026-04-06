import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api/events';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await getEvents(filters);
      setEvents(data.events);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">College Fest Events</h1>

      {/* Filters */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Events
            </label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Event name or description..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Creative">Creative</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No events found matching your criteria.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.EventID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {event.EventName}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.Status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    event.Status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.Status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Category:</span>
                    <span className="ml-1">{event.Category || 'General'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">
                      {new Date(event.EventDate).toLocaleDateString()}
                    </span>
                  </div>

                  {event.StartTime && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Time:</span>
                      <span className="ml-1">
                        {event.StartTime} - {event.EndTime || 'TBD'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Capacity:</span>
                    <span className="ml-1">
                      {event.Current_Capacity}/{event.Max_Capacity}
                    </span>
                  </div>

                  {event.TeamSize > 1 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Team Size:</span>
                      <span className="ml-1">{event.TeamSize}</span>
                    </div>
                  )}

                  {event.VenueName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Venue:</span>
                      <span className="ml-1">{event.VenueName}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.Description || 'No description available.'}
                </p>

                <Link
                  to={`/events/${event.EventID}`}
                  className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;