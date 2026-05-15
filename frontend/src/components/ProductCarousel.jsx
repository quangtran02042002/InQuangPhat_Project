import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight, FaStar } from 'react-icons/fa';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandom = async () => {
      try {
        const { data } = await axios.get('/api/products/random?limit=20');
        setProducts(data || []);
      } catch (err) {
        console.error('Lỗi tải sản phẩm carousel:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRandom();
  }, []);

  if (loading || products.length === 0) return null;

  // Duplicate list for seamless infinite loop
  const doubledProducts = [...products, ...products];

  return (
    <section className="product-carousel-section">
      {/* Decorative background elements */}
      <div className="product-carousel-bg-glow product-carousel-bg-glow--1" />
      <div className="product-carousel-bg-glow product-carousel-bg-glow--2" />

      <div className="product-carousel-header">
        <div className="product-carousel-header-inner">
          <div className="product-carousel-badge">
            <FaStar className="product-carousel-badge-icon" />
          </div>
          <div>
            <h2 className="product-carousel-title">Sản Phẩm Nổi Bật</h2>
            <p className="product-carousel-subtitle">
              Khám phá các sản phẩm in ấn chất lượng cao từ In Quang Phát
            </p>
          </div>
        </div>
        <Link to="/products" className="product-carousel-viewall">
          Xem tất cả <FaArrowRight className="product-carousel-viewall-icon" />
        </Link>
      </div>

      <div className="product-carousel-track-wrapper">
        {/* Gradient overlays */}
        <div className="product-carousel-fade-left" />
        <div className="product-carousel-fade-right" />

        <div className="product-carousel-track">
          {doubledProducts.map((product, idx) => {
            const imageUrl =
              product.images && product.images.length > 0
                ? product.images[0].url
                : '/images/slide2.jpg';

            return (
              <Link
                to={`/product/${product._id}`}
                key={`${product._id}-${idx}`}
                className="product-carousel-card"
              >
                <div className="product-carousel-card-img-wrapper">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-carousel-card-img"
                    loading="lazy"
                  />
                  {/* Shine effect on hover */}
                  <div className="product-carousel-card-shine" />
                  <div className="product-carousel-card-overlay">
                    <span className="product-carousel-card-cta">
                      Xem chi tiết <FaArrowRight style={{ fontSize: '10px' }} />
                    </span>
                  </div>
                </div>
                <div className="product-carousel-card-body">
                  <span className="product-carousel-card-category">
                    {product.category}
                  </span>
                  <h3 className="product-carousel-card-name">{product.name}</h3>
                </div>
                {/* Bottom accent bar */}
                <div className="product-carousel-card-accent" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
