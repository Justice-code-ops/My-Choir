import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicAPI } from "../../api/client";
import { Calendar, ArrowLeft } from "lucide-react";
import { formatDate, resolveAssetUrl } from "../../utils/format";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await publicAPI.getBlogPost(slug);
        setPost(res.data?.data || null);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading post...</div>;

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-center text-gray-500 dark:text-gray-400">Post not found</p>
      </div>
    );
  }

  const coverUrl = resolveAssetUrl(post.coverImage?.url || post.file?.url);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Link to="/blog" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8">
        <ArrowLeft size={18} />
        Back to Blog
      </Link>

      {coverUrl && (
        <img src={coverUrl} alt={post.title} className="w-full h-72 md:h-96 object-cover rounded-lg mb-8" />
      )}

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-8">
        <Calendar size={18} />
        {formatDate(post.publishedAt || post.createdAt)}
      </div>

      {post.summary && (
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{post.summary}</p>
      )}

      <div className="prose dark:prose-invert max-w-none">
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {post.body || "This post does not have body content yet."}
        </div>
      </div>
    </div>
  );
}
