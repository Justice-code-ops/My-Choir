import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, Plus, Save, Search, Trash2, X } from "lucide-react";
import { adminContentAPI } from "../../api/client";
import { formatDate } from "../../utils/format";

const emptyForm = {
  title: "",
  summary: "",
  body: "",
  category: "",
  tags: "",
  visibility: "public",
  published: true
};

const getExcerpt = (post) => post.summary || post.body?.slice(0, 140) || "";

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) =>
      [post.title, post.summary, post.body, post.category, post.slug]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [posts, search]);

  const fetchPosts = async () => {
    const res = await adminContentAPI.listBlogPosts({ limit: 100 });
    setPosts(res.data?.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchPosts();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectPost = (post) => {
    setSelectedPost(post);
    setError("");
    setMessage("");
    setForm({
      title: post.title || "",
      summary: post.summary || "",
      body: post.body || "",
      category: post.category || "",
      tags: post.tags?.join(", ") || "",
      visibility: post.visibility || "public",
      published: Boolean(post.published)
    });
  };

  const resetForm = () => {
    setSelectedPost(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        summary: form.summary.trim(),
        body: form.body.trim(),
        category: form.category.trim(),
        tags: form.tags,
        published: Boolean(form.published)
      };

      if (selectedPost) {
        await adminContentAPI.updateBlogPost(selectedPost._id, payload);
        setMessage("Blog post updated.");
      } else {
        await adminContentAPI.createBlogPost(payload);
        setMessage("Blog post created.");
      }

      await fetchPosts();
      if (!selectedPost) setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Blog post could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      await adminContentAPI.deleteBlogPost(post._id);
      setMessage("Blog post deleted.");
      await fetchPosts();
      if (selectedPost?._id === post._id) resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Blog post could not be deleted.");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create, edit, publish, and manage public blog information.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedPost ? "Edit Post" : "Create Post"}
            </h2>
            {selectedPost && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
              >
                <X size={18} />
                Clear
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              placeholder="Post title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <input
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                placeholder="News"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibility</label>
              <select
                value={form.visibility}
                onChange={(event) => updateField("visibility", event.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              >
                <option value="public">Public</option>
                <option value="members">Members</option>
                <option value="admins">Admins</option>
              </select>
            </div>
            <label className="flex items-end gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => updateField("published", event.target.checked)}
                className="mb-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="pb-2">Published</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</label>
            <textarea
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              maxLength={300}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              placeholder="Short post summary"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{form.summary.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Body</label>
            <textarea
              value={form.body}
              onChange={(event) => updateField("body", event.target.value)}
              rows="12"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              placeholder="Write the full post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
            <input
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              placeholder="worship, rehearsal, news"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : selectedPost ? "Save Changes" : "Publish Post"}
          </button>
        </form>

        <aside className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 h-fit">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>

          <div className="space-y-3 max-h-[780px] overflow-auto pr-1">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <article
                  key={post._id}
                  className={`border rounded-lg p-4 ${
                    selectedPost?._id === post._id
                      ? "border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-900"
                      : "border-gray-200 dark:border-dark-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(post.publishedAt || post.updatedAt)} - {post.visibility}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      post.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                    }`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  {getExcerpt(post) && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{getExcerpt(post)}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => selectPost(post)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600"
                    >
                      <Edit3 size={15} />
                      Edit
                    </button>
                    {post.slug && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600"
                      >
                        <Eye size={15} />
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg hover:bg-red-100 dark:hover:bg-red-800"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                No blog posts found.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
