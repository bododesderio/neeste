import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useTheme } from "../hooks/useTheme.js";
import Navigation from "../components/Navigation.jsx";
import Footer from "../components/Footer.jsx";

export default function BlogPost() {
  const { slug } = useParams();
  const [settings, setSettings] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bootRes, postRes] = await Promise.all([
          api.get("/public/bootstrap/"),
          api.get(`/public/blog/${slug}/`),
        ]);
        setSettings(bootRes.data.settings);
        setPost(postRes.data);
      } catch (err) {
        setError("Post not found");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Apply theme colors globally
  useTheme(settings);

  const theme = settings?.theme || { bg: "#0b1220", accent: "#f59e0b" };
  const bgColor = settings?.secondary_color || theme.bg || "#0b1220";

  if (loading) {
    return (
      <div style={{ background: bgColor }} className="min-h-screen text-white flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ background: bgColor }} className="min-h-screen text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Navigation settings={settings} />
          <div className="mt-10 glass rounded-3xl p-10 text-center">
            <p className="text-white/70">{error || "Post not found"}</p>
            <Link to="/blog" className="mt-4 inline-block text-amber-500 hover:underline">
              ← Back to Blog
            </Link>
          </div>
          <Footer settings={settings} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor }} className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Navigation settings={settings} />

        <div className="mt-6">
          <Link to="/blog" className="text-sm text-white/70 hover:text-white">
            ← Back to Blog
          </Link>
        </div>

        <article className="mt-6 glass rounded-3xl overflow-hidden">
          {post.featured_image_url && (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>

            <div className="mt-4 flex items-center gap-4 text-sm text-white/50">
              <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{post.views} views</span>
            </div>

            {post.excerpt && (
              <p className="mt-6 text-lg text-white/80 italic border-l-4 border-amber-500 pl-4">
                {post.excerpt}
              </p>
            )}

            <div 
              className="mt-8 prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Footer */}
        <Footer settings={settings} />
      </div>
    </div>
  );
}
