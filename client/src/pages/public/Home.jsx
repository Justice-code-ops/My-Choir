import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Music, Calendar, Users, Award } from "lucide-react";
import { publicAPI } from "../../api/client";
import { formatDate } from "../../utils/format";

const excerpt = (item) => item.summary || item.body?.slice(0, 150) || "";

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, announcementsRes] = await Promise.all([
          publicAPI.getUpcomingEvents(),
          publicAPI.getAnnouncements()
        ]);
        setUpcomingEvents(eventsRes.data?.data?.slice(0, 3) || []);
        setAnnouncements(announcementsRes.data?.data?.slice(0, 3) || []);
      } catch {
        setUpcomingEvents([]);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Voice of Light Chorale</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">Celebrating Music, Faith & Community</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth/register" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100">
                Join Us
              </Link>
              <Link to="/events" className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800">
                Our Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <Music className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Excellence</h3>
            <p className="text-gray-600 dark:text-gray-400">Pursuing musical excellence in worship</p>
          </div>
          <div className="text-center">
            <Calendar className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Events</h3>
            <p className="text-gray-600 dark:text-gray-400">Regular rehearsals and performances</p>
          </div>
          <div className="text-center">
            <Users className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">Building lasting friendships</p>
          </div>
          <div className="text-center">
            <Award className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Growth</h3>
            <p className="text-gray-600 dark:text-gray-400">Developing vocal and spiritual growth</p>
          </div>
        </div>

        {!loading && upcomingEvents.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event._id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {formatDate(event.startsAt)}{event.location ? ` at ${event.location}` : ""}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/events" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View All Events
              </Link>
            </div>
          </div>
        )}

        {!loading && announcements.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest News</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 border-l-4 border-blue-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{announcement.title}</h3>
                  {excerpt(announcement) && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{excerpt(announcement)}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-500">{formatDate(announcement.publishedAt || announcement.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
