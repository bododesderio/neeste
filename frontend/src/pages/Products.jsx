import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products/`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Our Products
          </h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Fresh farm eggs and premium digital cookbooks delivered to your door
          </p>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-yellow-500 text-black rounded-full mb-3">
                      {product.product_type}
                    </span>
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-400">
                        {new Intl.NumberFormat('en-UG', {
                          style: 'currency',
                          currency: 'UGX',
                          minimumFractionDigits: 0
                        }).format(product.price)}
                      </span>
                      <Link
                        to="/checkout"
                        state={{ product }}
                        className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
