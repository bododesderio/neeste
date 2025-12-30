import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { api } from "../api.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get("/public/bootstrap/").then(res => {
      setSettings(res.data.settings);
      setProducts(res.data.products);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation settings={settings} />
      
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          Our Products
        </h1>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Fresh farm eggs and premium digital cookbooks delivered to your door
        </p>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <div
                key={product.id}
                className="glass rounded-3xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded-full mb-3">
                    {product.type}
                  </span>
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-slate-400 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-yellow-400">
                      {Number(product.price).toLocaleString()} UGX
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
