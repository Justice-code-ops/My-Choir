import { useEffect, useState } from "react";
import { publicAPI } from "../../api/client";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await publicAPI.getGallery();
        setGallery(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Photo Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gallery.length > 0 ? (
          gallery.map((item) => (
            <div key={item._id} className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              {item.image && (
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
            No gallery items yet.
          </div>
        )}
      </div>
    </div>
  );
}
