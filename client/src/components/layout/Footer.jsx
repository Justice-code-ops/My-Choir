import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiYoutube, FiMail } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-800 dark:bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">Voice of Light</h3>
            <p className="text-gray-400">Your Voice, Our Harmony</p>
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
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FiFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiInstagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiYoutube size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiMail size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-700 pt-8">
          <p className="text-center text-gray-400">
            &copy; {currentYear} Voice of Light Chorale. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
