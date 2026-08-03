import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { publicAPI } from "../../api/client";
import { Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await publicAPI.getBlogPost(slug);
        setPost(res.data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-center text-gray-500 dark:text-gray-400">Post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Link to="/blog" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8">
        <ArrowLeft size={18} />
        Back to Blog
      </Link>

      {post.image && (
        <img src={post.image} alt={post.title} className="w-full h-96 object-cover rounded-lg mb-8" />
      )}

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
      
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-8">
        <Calendar size={18} />
        {new Date(post.publishedDate || post.createdAt).toLocaleDateString()}
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {post.content}
        </div>
      </div>
    </div>
  );
}
