import { useEffect, useState } from "react";
import { publicAPI } from "../../api/client";
import { Calendar, MapPin } from "lucide-react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await publicAPI.getEvents();
        setEvents(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Our Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              {event.image && (
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(event.eventDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
            No events scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
}
