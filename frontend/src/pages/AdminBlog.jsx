import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "DRAFT",
    meta_description: "",
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
    
    // Add custom dark theme styles for Quill editor
    const style = document.createElement('style');
    style.textContent = `
      /* Dark theme for Quill editor */
      .ql-container {
        background-color: #1e293b !important;
        color: #ffffff !important;
        font-size: 16px !important;
      }
      
      .ql-editor {
        color: #ffffff !important;
        min-height: 250px;
      }
      
      .ql-editor.ql-blank::before {
        color: #94a3b8 !important;
      }
      
      .ql-editor p,
      .ql-editor ol,
      .ql-editor ul,
      .ql-editor pre,
      .ql-editor blockquote,
      .ql-editor h1,
      .ql-editor h2,
      .ql-editor h3,
      .ql-editor h4,
      .ql-editor h5,
      .ql-editor h6 {
        color: #ffffff !important;
      }
      
      .ql-snow .ql-stroke {
        stroke: #64748b !important;
      }
      
      .ql-snow .ql-fill {
        fill: #64748b !important;
      }
      
      .ql-snow .ql-picker-label {
        color: #64748b !important;
      }
      
      .ql-toolbar {
        background-color: #334155 !important;
        border: none !important;
        border-bottom: 1px solid #475569 !important;
      }
      
      .ql-snow.ql-toolbar button:hover,
      .ql-snow .ql-toolbar button:hover,
      .ql-snow.ql-toolbar button.ql-active,
      .ql-snow .ql-toolbar button.ql-active {
        color: #fbbf24 !important;
      }
      
      .ql-snow.ql-toolbar button:hover .ql-stroke,
      .ql-snow .ql-toolbar button:hover .ql-stroke,
      .ql-snow.ql-toolbar button.ql-active .ql-stroke,
      .ql-snow .ql-toolbar button.ql-active .ql-stroke {
        stroke: #fbbf24 !important;
      }
      
      .ql-snow.ql-toolbar button:hover .ql-fill,
      .ql-snow .ql-toolbar button:hover .ql-fill,
      .ql-snow.ql-toolbar button.ql-active .ql-fill,
      .ql-snow .ql-toolbar button.ql-active .ql-fill {
        fill: #fbbf24 !important;
      }
      
      .ql-container {
        border: none !important;
      }
      
      .ql-editor a {
        color: #fbbf24 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  async function loadPosts() {
    try {
      const res = await api.get("/admin/blog/");
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  }

  function openCreateForm() {
    setEditingPost(null);
    setForm({
      title: "",
      excerpt: "",
      content: "",
      status: "DRAFT",
      meta_description: "",
    });
    setFeaturedImage(null);
    setShowForm(true);
  }

  function openEditForm(post) {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      meta_description: post.meta_description || "",
    });
    setFeaturedImage(null);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("excerpt", form.excerpt);
      formData.append("content", form.content);
      formData.append("status", form.status);
      formData.append("meta_description", form.meta_description);
      
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }

      if (editingPost) {
        await api.put(`/admin/blog/${editingPost.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/blog/create/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowForm(false);
      loadPosts();
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/admin/blog/${id}/`);
      loadPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post.");
    }
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Management</h1>
          <p className="text-slate-400 mt-1">Create and manage blog posts</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition-colors"
        >
          + New Post
        </button>
      </div>

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Featured Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFeaturedImage(e.target.files[0])}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                />
                {editingPost?.featured_image_url && !featuredImage && (
                  <img src={editingPost.featured_image_url} alt="Current" className="mt-2 h-32 rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Excerpt (max 300 chars)</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
                <div className="text-xs text-slate-500 mt-1">{form.excerpt.length}/300 characters</div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Content *</label>
                <div className="rounded-xl overflow-hidden border border-slate-600">
                  <ReactQuill
                    theme="snow"
                    value={form.content}
                    onChange={(content) => setForm({ ...form, content })}
                    modules={quillModules}
                    placeholder="Start writing your blog post..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Meta Description (SEO, max 160 chars)</label>
                <input
                  type="text"
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  maxLength={160}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Brief description for search engines"
                />
                <div className="text-xs text-slate-500 mt-1">{form.meta_description.length}/160 characters</div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Status *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No blog posts yet. Create your first post!
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Views</th>
                <th className="p-4">Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                  <td className="p-4">
                    <div className="font-semibold text-white">{post.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{post.slug}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === "PUBLISHED"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{post.views}</td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(post)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
