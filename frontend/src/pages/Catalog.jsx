import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import TryOnModal from '../components/TryOnModal';

const CATEGORIES = ['top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory'];
const TRYON_SUPPORTED = ['top', 'bottom', 'dress', 'outerwear'];

function ProductCard({ product, onAddToWardrobe, savingWardrobe, onTryOn }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [size, setSize] = useState(product.sizes?.[0] || '');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const tryOnSupported = TRYON_SUPPORTED.includes(product.category);

  async function handleAddToBag() {
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addItem(product._id, { size, color: product.colors?.[0], quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } finally {
      setAdding(false);
    }
  }

  function handleTryOnClick() {
    if (!user) {
      navigate('/login');
      return;
    }
    onTryOn(product);
  }

  return (
    <div className="card">
      <div
        style={{
          height: 180,
          borderRadius: 3,
          marginBottom: 16,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1c1c22, #0B0B10)',
        }}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--slate)',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            NO IMAGE YET
          </div>
        )}
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--thread)', marginBottom: 6 }}>
        {product.category.toUpperCase()}
      </div>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 6 }}>{product.name}</h3>
      <div style={{ color: 'var(--gold)', fontSize: 14, marginBottom: 14 }}>${product.price}</div>

      {product.sizes?.length > 0 && (
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          style={{ marginBottom: 10, fontSize: 12, padding: '8px 10px' }}
        >
          {product.sizes.map((s) => (
            <option key={s} value={s}>Size {s}</option>
          ))}
        </select>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          className="btn primary"
          style={{ flex: 1, fontSize: 12, padding: '10px 14px' }}
          onClick={handleTryOnClick}
          disabled={!tryOnSupported}
          title={tryOnSupported ? '' : 'Try-on supports tops, bottoms, outerwear, and dresses for now'}
        >
          Try On
        </button>
        {user && (
          <button
            className="btn"
            style={{ fontSize: 12, padding: '10px 14px' }}
            onClick={() => onAddToWardrobe(product)}
            disabled={savingWardrobe === product._id}
          >
            {savingWardrobe === product._id ? '…' : '+ Closet'}
          </button>
        )}
      </div>

      <button
        className="btn"
        style={{
          width: '100%',
          fontSize: 12,
          padding: '10px 14px',
          borderColor: added ? 'var(--gold)' : undefined,
          color: added ? 'var(--gold)' : undefined,
        }}
        onClick={handleAddToBag}
        disabled={adding || product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding…' : added ? '✓ Added to Bag' : 'Add to Bag'}
      </button>
    </div>
  );
}

export default function Catalog() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [tryOnProduct, setTryOnProduct] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: category ? { category } : {} })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [category]);

  async function addToWardrobe(product) {
    if (!user) return;
    setSavingId(product._id);
    try {
      await api.post('/wardrobe', {
        name: product.name,
        category: product.category,
        color: product.colors?.[0],
        image: product.images?.[0],
        occasionTags: product.occasionTags,
        sourceProduct: product._id,
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 100 }}>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1>Shop</h1>
          <p>Every item here can be tried on and, once you own it, logged straight to your wardrobe.</p>
        </div>
        <Link to="/cart" className="btn">View Bag</Link>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        <button className={`btn ${category === '' ? 'primary' : ''}`} onClick={() => setCategory('')}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`btn ${category === c ? 'primary' : ''}`}
            onClick={() => setCategory(c)}
            style={{ textTransform: 'capitalize' }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading catalogue…</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          No products yet — run <code>npm run seed</code> in the backend to load sample items.
        </div>
      ) : (
        <div className="grid-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} onAddToWardrobe={addToWardrobe} savingWardrobe={savingId} onTryOn={setTryOnProduct} />
          ))}
        </div>
      )}

      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </div>
  );
}
