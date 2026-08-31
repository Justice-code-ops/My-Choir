import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiYoutube, FiMail } from "react-icons/fi";
import { publicAPI } from "../../api/client";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [churchInfo, setChurchInfo] = useState(null);

  useEffect(() => {
    const fetchChurchInfo = async () => {
      try {
        const res = await publicAPI.getChurchInfo();
        setChurchInfo(res.data?.data || null);
      } catch {
        setChurchInfo(null);
      }
    };
    fetchChurchInfo();
  }, []);

  const socialLinks = [
    { url: churchInfo?.socialMedia?.facebook, label: "Facebook", icon: FiFacebook },
    { url: churchInfo?.socialMedia?.instagram, label: "Instagram", icon: FiInstagram },
    { url: churchInfo?.socialMedia?.youtube, label: "YouTube", icon: FiYoutube }
  ].filter((item) => item.url);

  const organizationName = churchInfo?.name || "Voice of Light Chorale";
  const tagline = churchInfo?.tagline || "Your Voice, Our Harmony";

  return (
    <footer className="bg-dark-800 dark:bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">{organizationName}</h3>
            <p className="text-gray-400">{tagline}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/events" className="hover:text-white">Events</Link></li>
              <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map(({ url, label, icon: Icon }) => (
                <a key={label} href={url} aria-label={label} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                  <Icon size={24} />
                </a>
              ))}
              {churchInfo?.email ? (
                <a href={`mailto:${churchInfo.email}`} aria-label="Email" className="text-gray-400 hover:text-white">
                  <FiMail size={24} />
                </a>
              ) : (
                <Link to="/contact" aria-label="Contact" className="text-gray-400 hover:text-white">
                  <FiMail size={24} />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-dark-700 pt-8">
          <p className="text-center text-gray-400">
            &copy; {currentYear} {organizationName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
