import { useEffect, useState } from "react";
import { publicAPI } from "../../api/client";
import { Users, Target, Heart } from "lucide-react";
import { resolveAssetUrl } from "../../utils/format";

export default function About() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await publicAPI.getExecutives();
        setExecutives(res.data?.data || []);
      } catch {
        setExecutives([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutives();
  }, []);

  return (
    <div>
      {/* About Section */}
      <section className="bg-blue-50 dark:bg-dark-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About Voice of Light Chorale</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Voice of Light Chorale is a vibrant community of singers dedicated to advancing the art and joy of choral music. 
            Our mission is to provide excellent choral music, foster spiritual growth, and build meaningful connections within our community.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            With members spanning four voice parts (Soprano, Alto, Tenor, Bass), we perform a diverse repertoire ranging from classical masterworks to contemporary compositions.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Target className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Excellence</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We strive for musical excellence in every performance and rehearsal.
            </p>
          </div>
          <div className="text-center">
            <Users className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We foster a welcoming environment for singers of all levels and backgrounds.
            </p>
          </div>
          <div className="text-center">
            <Heart className="mx-auto mb-4 text-blue-600" size={40} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Passion</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We are passionate about music and its power to inspire and uplift souls.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      {!loading && executives.length > 0 && (
        <section className="bg-gray-50 dark:bg-dark-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {executives.map((exec) => (
                <div key={exec._id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 text-center">
                  {resolveAssetUrl(exec.image?.url) && (
                    <img src={resolveAssetUrl(exec.image.url)} alt={exec.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exec.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{exec.position}</p>
                  {(exec.summary || exec.biography) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exec.summary || exec.biography}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
