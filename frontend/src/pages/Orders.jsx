import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const STATUS_COLOR = {
  placed: 'var(--gold)',
  processing: 'var(--gold)',
  shipped: 'var(--thread)',
  delivered: '#4a9d6e',
  cancelled: 'var(--slate)',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingBottom: 100 }}>
      <div className="page-head">
        <h1>Your Orders</h1>
        <p>Everything you've bought through THREAD.</p>
      </div>

      {loading ? (
        <div className="empty-state">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          No orders yet. <Link to="/catalog" style={{ color: 'var(--thread)' }}>Start shopping.</Link>
        </div>
      ) : (
        orders.map((order) => (
          <Link
            key={order._id}
            to={`/order-confirmation/${order._id}`}
            className="card"
            style={{ display: 'block', marginBottom: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--slate)' }}>
                  #{order._id.slice(-8).toUpperCase()} — {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="mono" style={{ fontSize: 12, color: STATUS_COLOR[order.status] || 'var(--bone-dim)', marginTop: 4, textTransform: 'uppercase' }}>
                  {order.status}
                </div>
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>${order.total.toFixed(2)}</div>
            </div>
            <div style={{ color: 'var(--bone-dim)', fontSize: 13 }}>
              {order.items.map((i) => i.name).join(', ')}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
