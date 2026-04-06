import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../api/events';
import { useAuth } from '../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isStudent } = useAuth();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const { data } = await getEvent(id);
      setEvent(data.event);
      setTeams(data.teams || []);
    } catch (err) {
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading event details...</div>
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

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <Link to="/events" className="text-blue-600 hover:text-blue-500">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isEventFull = event.Current_Capacity >= event.Max_Capacity;
  const canRegister = isAuthenticated && isStudent && event.Status === 'upcoming' && !isEventFull;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/events" className="text-blue-600 hover:text-blue-500 text-sm">
          ← Back to Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{event.EventName}</h1>
              <span className={`px-3 py-1 text-sm rounded-full ${
                event.Status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                event.Status === 'active' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.Status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</h3>
                <p className="mt-1 text-sm text-gray-900">{event.Category || 'General'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(event.EventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {event.StartTime && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Time</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {event.StartTime} - {event.EndTime || 'TBD'}
                  </p>
                </div>
              )}

              {event.VenueName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Venue</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {event.VenueName}
                    {event.City && (
                      <span className="text-gray-500">, {event.City}</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {event.Description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">About This Event</h3>
                <p className="text-gray-700 leading-relaxed">{event.Description}</p>
              </div>
            )}
          </div>

          {/* Teams Section */}
          {teams.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Registered Teams ({teams.length})
              </h3>
              <div className="space-y-3">
                {teams.map((team) => (
                  <div key={team.TeamID} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{team.TeamName}</h4>
                    <p className="text-sm text-gray-600">
                      Leader: {team.FName} {team.LName} ({team.LeaderEmail})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Join Code: {team.JoinCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Capacity</span>
                <div className="mt-1">
                  <div className="flex justify-between text-sm">
                    <span>{event.Current_Capacity} registered</span>
                    <span>{event.Max_Capacity} max</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        isEventFull ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min((event.Current_Capacity / event.Max_Capacity) * 100, 100)}%`
                      }}
                    />
                  </div>
                  {isEventFull && (
                    <p className="text-red-600 text-sm mt-1">Event is full</p>
                  )}
                </div>
              </div>

              {event.TeamSize > 1 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Team Size</span>
                  <p className="mt-1 text-sm text-gray-900">
                    {event.TeamSize} members per team
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                {canRegister ? (
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Register for Event
                  </button>
                ) : !isAuthenticated ? (
                  <Link 
                    to="/auth" 
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Login to Register
                  </Link>
                ) : isEventFull ? (
                  <button 
                    disabled 
                    className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                  >
                    Event Full
                  </button>
                ) : event.Status !== 'upcoming' ? (
                  <button 
                    disabled 
                    className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <button 
                    disabled 
                    className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                  >
                    Cannot Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;