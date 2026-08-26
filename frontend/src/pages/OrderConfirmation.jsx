import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container empty-state" style={{ paddingTop: 80 }}>Loading your order…</div>;
  if (!order) return <div className="container empty-state" style={{ paddingTop: 80 }}>Order not found.</div>;

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 70, paddingBottom: 100 }}>
      <div className="mono" style={{ color: 'var(--gold)', fontSize: 12, marginBottom: 14 }}>
        ✓ {order.payment.status === 'paid' ? 'PAYMENT CONFIRMED' : 'ORDER PLACED — PAY ON DELIVERY'}
      </div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, marginBottom: 10 }}>Thank you.</h1>
      <p style={{ color: 'var(--bone-dim)', marginBottom: 32 }}>
        Order <span className="mono">#{order._id.slice(-8).toUpperCase()}</span> is confirmed and heading to {order.shippingAddress.city}.
      </p>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--thread)', marginBottom: 16 }}>ITEMS</div>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: 'var(--bone-dim)' }}>
            <span>{item.name} {item.size && `(${item.size})`} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontFamily: "'Fraunces', serif", paddingTop: 14, borderTop: '1px solid rgba(237,231,218,0.12)', marginTop: 10 }}>
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--thread)', marginBottom: 12 }}>DELIVERING TO</div>
        <p style={{ fontSize: 14, color: 'var(--bone-dim)', lineHeight: 1.7 }}>
          {order.shippingAddress.fullName}<br />
          {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
          {order.shippingAddress.country}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        <Link to="/orders" className="btn">View My Orders</Link>
        <Link to="/catalog" className="btn primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
