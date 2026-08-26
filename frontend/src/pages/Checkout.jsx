import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';

const EMPTY_ADDRESS = {
  fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '',
};

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  function updateAddress(field, value) {
    setAddress((a) => ({ ...a, [field]: value }));
  }
  function updateCard(field, value) {
    setCard((c) => ({ ...c, [field]: value }));
  }

  const shippingFee = cart.subtotal >= 150 ? 0 : 6.99;
  const total = cart.subtotal + shippingFee;

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const res = await api.post('/orders/checkout', {
        shippingAddress: address,
        paymentMethod,
        card: paymentMethod === 'card' ? card : undefined,
      });
      await refresh();
      navigate(`/order-confirmation/${res.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div className="empty-state">
          Your bag is empty. <Link to="/catalog" style={{ color: 'var(--thread)' }}>Go find something to wear.</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: 100 }}>
      <div className="page-head">
        <h1>Checkout</h1>
        <p>Payment here is simulated — no real charge is made. Wire a live gateway in behind this same form later.</p>
      </div>

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }} className="cart-grid">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--thread)', marginBottom: 16 }}>SHIPPING ADDRESS</div>
            <div className="field">
              <label>Full Name</label>
              <input value={address.fullName} onChange={(e) => updateAddress('fullName', e.target.value)} required />
            </div>
            <div className="field">
              <label>Address Line 1</label>
              <input value={address.line1} onChange={(e) => updateAddress('line1', e.target.value)} required />
            </div>
            <div className="field">
              <label>Address Line 2 (optional)</label>
              <input value={address.line2} onChange={(e) => updateAddress('line2', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field">
                <label>City</label>
                <input value={address.city} onChange={(e) => updateAddress('city', e.target.value)} required />
              </div>
              <div className="field">
                <label>State</label>
                <input value={address.state} onChange={(e) => updateAddress('state', e.target.value)} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field">
                <label>Postal Code</label>
                <input value={address.postalCode} onChange={(e) => updateAddress('postalCode', e.target.value)} required />
              </div>
              <div className="field">
                <label>Country</label>
                <input value={address.country} onChange={(e) => updateAddress('country', e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={address.phone} onChange={(e) => updateAddress('phone', e.target.value)} required />
            </div>
          </div>

          <div className="card">
            <div className="mono" style={{ fontSize: 11, color: 'var(--thread)', marginBottom: 16 }}>PAYMENT METHOD</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { id: 'card', label: 'Card' },
                { id: 'upi', label: 'UPI' },
                { id: 'cod', label: 'Cash on Delivery' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className={`btn ${paymentMethod === m.id ? 'primary' : ''}`}
                  onClick={() => setPaymentMethod(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <>
                <div className="field">
                  <label>Name on Card</label>
                  <input value={card.name} onChange={(e) => updateCard('name', e.target.value)} required />
                </div>
                <div className="field">
                  <label>Card Number</label>
                  <input
                    value={card.number}
                    onChange={(e) => updateCard('number', e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="field">
                    <label>Expiry</label>
                    <input
                      value={card.expiry}
                      onChange={(e) => updateCard('expiry', e.target.value)}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>CVV</label>
                    <input
                      value={card.cvv}
                      onChange={(e) => updateCard('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: -6 }}>
                  Test mode — enter any digits, nothing is actually charged.
                </p>
              </>
            )}
            {paymentMethod === 'upi' && (
              <div className="field">
                <label>UPI ID</label>
                <input placeholder="yourname@upi" required />
                <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }}>Test mode — simulated, no real request sent.</p>
              </div>
            )}
            {paymentMethod === 'cod' && (
              <p style={{ fontSize: 13, color: 'var(--bone-dim)', lineHeight: 1.6 }}>
                Pay in cash when your order arrives. Order is placed immediately, payment is marked pending.
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--thread)', marginBottom: 16 }}>ORDER SUMMARY</div>
          {cart.items.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: 'var(--bone-dim)' }}>
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(237,231,218,0.12)', color: 'var(--bone-dim)' }}>
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, marginBottom: 16, color: 'var(--slate)' }}>
            <span>Shipping</span>
            <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontFamily: "'Fraunces', serif", paddingTop: 14, borderTop: '1px solid rgba(237,231,218,0.12)', marginBottom: 20 }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {error && <div className="error-msg">{error}</div>}
          <button className="btn primary" type="submit" disabled={placing} style={{ width: '100%' }}>
            {placing ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
