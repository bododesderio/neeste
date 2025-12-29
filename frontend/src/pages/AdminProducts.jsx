import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    type: "PHYSICAL",
    description: "",
    price: "0",
    currency: "UGX",
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [digitalFile, setDigitalFile] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/admin/products/");
      setList(res.data);
    } catch (error) {
      console.error("Failed to load products:", error);
      setMsg("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setMsg("");

    if (!form.name || !form.price) {
      setMsg("Name and price are required");
      return;
    }

    try {
      const fd = new FormData();

      // Add all form fields
      fd.append("name", form.name);
      fd.append("type", form.type);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("currency", form.currency);
      fd.append("is_active", form.is_active.toString());

      // Add image if selected
      if (imageFile) {
        fd.append("image", imageFile);
      }

      // Add digital file if selected and type is DIGITAL
      if (digitalFile && form.type === "DIGITAL") {
        fd.append("file", digitalFile);
      }

      await api.post("/admin/products/create/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Reset form
      setForm({
        name: "",
        type: "PHYSICAL",
        description: "",
        price: "0",
        currency: "UGX",
        is_active: true
      });
      setImageFile(null);
      setDigitalFile(null);
      setMsg("Product created successfully ✅");
      load();
    } catch (error) {
      console.error("Create error:", error);
      setMsg("Failed to create product ❌");
    }
  }

  async function toggleActive(p) {
    try {
      const fd = new FormData();
      fd.append("is_active", (!p.is_active).toString());

      await api.put(`/admin/products/${p.id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      load();
    } catch (error) {
      console.error("Toggle error:", error);
      setMsg("Failed to update product");
    }
  }

  async function deleteProduct(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;

    try {
      await api.delete(`/admin/products/${p.id}/`);
      setMsg(`"${p.name}" deleted`);
      load();
    } catch (error) {
      console.error("Delete error:", error);
      setMsg("Failed to delete product");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
      <p className="text-white/70 text-sm mb-8">
        Manage your products. Upload images and digital files for downloadable items.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Product Form */}
        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Create Product</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Product Name *</label>
              <input
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Fresh Farm Eggs (Dozen)"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Type *</label>
              <select
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500 cursor-pointer"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="PHYSICAL">Physical Product</option>
                <option value="DIGITAL">Digital Product</option>
              </select>
              <p className="text-xs text-white/50 mt-1">
                {form.type === "DIGITAL" ? "Downloadable products like ebooks, PDFs" : "Physical items for delivery"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Price * (in {form.currency})</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="8000"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500 resize-none"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Premium quality eggs from free-range chickens..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-amber-500 file:text-black hover:file:bg-amber-600"
              />
              <p className="text-xs text-white/50 mt-1">Recommended: 800x600px or larger</p>
            </div>

            {form.type === "DIGITAL" && (
              <div>
                <label className="block text-sm text-white/70 mb-2">Digital File (PDF, ZIP, etc.)</label>
                <input
                  type="file"
                  onChange={e => setDigitalFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-amber-500 file:text-black hover:file:bg-amber-600"
                />
                <p className="text-xs text-white/50 mt-1">File users will download after purchase</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-white/5 cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm text-white cursor-pointer">
                Active (visible to customers)
              </label>
            </div>

            <button
              onClick={create}
              className="w-full px-6 py-4 rounded-2xl bg-amber-500 text-black font-semibold hover:bg-amber-600 transition-colors"
            >
              Create Product
            </button>

            {msg && (
              <div className={`text-sm ${msg.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                {msg}
              </div>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">All Products ({list.length})</h2>

          {loading ? (
            <div className="text-white/70">Loading products...</div>
          ) : list.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <svg className="w-16 h-16 mx-auto mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>No products yet</p>
              <p className="text-sm mt-1">Create your first product using the form</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {list.map(p => (
                <div
                  key={p.id}
                  className="glass rounded-2xl p-4 flex gap-4"
                >
                  {/* Product Image */}
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-sm text-white/60 mt-1">
                          {p.currency} {Number(p.price).toLocaleString()}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-lg ${
                            p.type === "DIGITAL"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {p.type === "DIGITAL" ? "📥 Digital" : "📦 Physical"}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-lg ${
                            p.is_active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {p.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleActive(p)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                          title={p.is_active ? "Disable" : "Enable"}
                        >
                          {p.is_active ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => deleteProduct(p)}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
