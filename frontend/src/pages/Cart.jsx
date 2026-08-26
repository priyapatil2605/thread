import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const isEmpty = !loading && cart.items.length === 0;

  return (
    <div className="container" style={{ paddingBottom: 100 }}>
      <div className="page-head">
        <h1>Your Bag</h1>
        <p>{cart.itemCount} item{cart.itemCount === 1 ? '' : 's'} ready for checkout.</p>
      </div>

      {loading ? (
        <div className="empty-state">Loading your bag…</div>
      ) : isEmpty ? (
        <div className="empty-state">
          Your bag is empty. <Link to="/catalog" style={{ color: 'var(--thread)' }}>Go find something to wear.</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }} className="cart-grid">
          <div>
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="card"
                style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #1c1c22, #0B0B10)',
                    borderRadius: 3,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, marginBottom: 4 }}>{item.name}</h3>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>
                    {[item.size && `SIZE ${item.size}`, item.color?.toUpperCase()].filter(Boolean).join(' // ')}
                  </div>
                  <div style={{ color: 'var(--gold)', fontSize: 14, marginTop: 6 }}>${item.price.toFixed(2)}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn" style={{ padding: '6px 12px', fontSize: 14 }} onClick={() => updateItem(item._id, item.quantity - 1)}>
                    −
                  </button>
                  <span className="mono" style={{ fontSize: 13, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn" style={{ padding: '6px 12px', fontSize: 14 }} onClick={() => updateItem(item._id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <button
                  className="btn"
                  style={{ fontSize: 11, padding: '8px 12px', borderColor: 'transparent', color: 'var(--slate)' }}
                  onClick={() => removeItem(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ alignSelf: 'flex-start' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--thread)', marginBottom: 16 }}>ORDER SUMMARY</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: 'var(--bone-dim)' }}>
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16, color: 'var(--slate)' }}>
              <span>Shipping</span>
              <span>{cart.subtotal >= 150 ? 'Free' : 'Calculated at checkout'}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 18,
                fontFamily: "'Fraunces', serif",
                paddingTop: 14,
                borderTop: '1px solid rgba(237,231,218,0.12)',
                marginBottom: 20,
              }}
            >
              <span>Total</span>
              <span>${cart.subtotal.toFixed(2)}+</span>
            </div>
            <button className="btn primary" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
