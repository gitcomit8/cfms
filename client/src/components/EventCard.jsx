import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const capacityPercent = event.Max_Capacity > 0
    ? Math.round((event.Current_Capacity / event.Max_Capacity) * 100)
    : 0;

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  const categoryColors = {
    tech: 'bg-purple-100 text-purple-700',
    cultural: 'bg-pink-100 text-pink-700',
    business: 'bg-amber-100 text-amber-700',
  };

  return (
    <Link
      to={`/events/${event.EventID}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-semibold text-gray-900 leading-tight">{event.EventName}</h3>
          <span className={`ml-2 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[event.Category] || 'bg-gray-100 text-gray-600'}`}>
            {event.Category}
          </span>
        </div>

        <div className="space-y-1 mb-4">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {event.EventDate}
            {event.StartTime && ` · ${event.StartTime}`}
          </p>
          {event.VenueName && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.VenueName}
            </p>
          )}
          {event.TeamSize > 1 && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Team of {event.TeamSize}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Capacity</span>
            <span>{event.Current_Capacity}/{event.Max_Capacity}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[event.Status] || 'bg-gray-100 text-gray-600'}`}>
            {event.Status}
          </span>
          <span className="text-xs text-blue-600 font-medium">View details →</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
