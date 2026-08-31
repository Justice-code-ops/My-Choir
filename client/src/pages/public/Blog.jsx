import { useEffect, useState } from "react";
import { publicAPI } from "../../api/client";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { formatDate } from "../../utils/format";

const getExcerpt = (post) => {
  const text = post.summary || post.body || "";
  return text.length > 200 ? `${text.slice(0, 200)}...` : text;
};

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await publicAPI.getBlog();
        setPosts(res.data?.data || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading posts...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Blog</h1>

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{post.title}</h2>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                <Calendar size={18} />
                {formatDate(post.publishedAt || post.createdAt)}
              </div>
              {getExcerpt(post) && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{getExcerpt(post)}</p>
              )}
              <Link to={`/blog/${post.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Read More
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No blog posts yet.
          </div>
        )}
      </div>
    </div>
  );
}
