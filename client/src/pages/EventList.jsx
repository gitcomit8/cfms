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
      <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-grape border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-foreground/70 font-medium tracking-wide animate-pulse">Loading amazing events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground mb-2">College Fest Events</h1>
            <p className="text-lg text-foreground/70">Discover and register for upcoming technical and cultural events.</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-pink/10 border border-pink text-pink px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-10 p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-semibold text-foreground mb-2">
                Search Events
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Event name or description..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-grape/50 focus:border-grape transition-all text-foreground placeholder:text-foreground/40"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-grape/50 focus:border-grape transition-all text-foreground appearance-none"
              >
                <option value="">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Creative">Creative</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-foreground mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-grape/50 focus:border-grape transition-all text-foreground appearance-none"
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
          <div className="text-center py-20 bg-card border border-border rounded-3xl">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No events found</h3>
            <p className="text-foreground/60 text-lg max-w-md mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.EventID} className="group flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-grape/30 transition-all duration-300">
                <div className="h-32 bg-gradient-to-br from-grape/20 to-pink/20 relative">
                  <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${
                      event.Status === 'upcoming' ? 'bg-blue/10 text-blue border border-blue/20' :
                      event.Status === 'active' ? 'bg-green/10 text-green border border-green/20' :
                      'bg-background text-foreground/70 border border-border'
                    }`}>
                      {event.Status}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-grape uppercase tracking-wider mb-2 block">
                      {event.Category || 'General'}
                    </span>
                    <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight group-hover:text-grape transition-colors">
                      {event.EventName}
                    </h3>
                  </div>

                  <p className="text-foreground/70 text-sm mb-6 line-clamp-3 flex-grow">
                    {event.Description || 'No description available for this event.'}
                  </p>

                  <div className="space-y-3 mb-6 bg-background rounded-xl p-4 border border-border/50">
                    <div className="flex items-center text-sm text-foreground/80">
                      <svg className="w-4 h-4 mr-3 text-grape/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(event.EventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>

                    {event.StartTime && (
                      <div className="flex items-center text-sm text-foreground/80">
                        <svg className="w-4 h-4 mr-3 text-grape/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {event.StartTime} {event.EndTime ? `- ${event.EndTime}` : ''}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-foreground/80">
                      <svg className="w-4 h-4 mr-3 text-grape/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {event.Current_Capacity}/{event.Max_Capacity} Registered
                      {event.TeamSize > 1 && <span className="ml-2 text-xs bg-pink/10 text-pink px-2 py-0.5 rounded-full border border-pink/20">Team: {event.TeamSize}</span>}
                    </div>
                  </div>

                  <Link
                    to={`/events/${event.EventID}`}
                    className="block w-full text-center bg-card border-2 border-grape text-grape hover:bg-grape hover:text-white px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300"
                  >
                    View Event Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;