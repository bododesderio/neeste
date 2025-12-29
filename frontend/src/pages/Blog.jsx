import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useTheme } from "../hooks/useTheme.js";
import Navigation from "../components/Navigation.jsx";
import Footer from "../components/Footer.jsx";

export default function Blog() {
  const [settings, setSettings] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bootRes, blogRes] = await Promise.all([
          api.get("/public/bootstrap/"),
          api.get("/public/blog/"),
        ]);
        setSettings(bootRes.data.settings);
        setPosts(blogRes.data);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Apply theme colors globally
  useTheme(settings);

  const theme = settings?.theme || { bg: "#0b1220", accent: "#f59e0b" };
  const bgColor = settings?.secondary_color || theme.bg || "#0b1220";

  return (
    <div style={{ background: bgColor }} className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Navigation settings={settings} />

        <div className="mt-10">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="mt-2 text-white/70">
            Stories, tips, and insights about eggs, cooking, and healthy living.
          </p>

          {loading ? (
            <div className="mt-8 text-center text-white/60">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="mt-8 glass rounded-3xl p-10 text-center">
              <p className="text-white/70">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="glass rounded-3xl overflow-hidden hover:scale-105 transition-transform"
                >
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/70 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer settings={settings} />
      </div>
    </div>
  );
}
