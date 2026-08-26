import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', category: 'top', color: '' });

  function load() {
    setLoading(true);
    api.get('/wardrobe').then((res) => setItems(res.data.items)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name) return;
    await api.post('/wardrobe', form);
    setForm({ name: '', category: 'top', color: '' });
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/wardrobe/${id}`);
    load();
  }

  async function handleWorn(id) {
    await api.put(`/wardrobe/${id}/worn`);
    load();
  }

  return (
    <div className="container" style={{ paddingBottom: 100 }}>
      <div className="page-head">
        <h1>Your Wardrobe</h1>
        <p>Everything you already own, so THREAD stops suggesting things you already have.</p>
      </div>

      <form onSubmit={handleAdd} className="card" style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <input
          placeholder="Item name (e.g. Navy Chinos)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ flex: 2, minWidth: 180 }}
        />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ flex: 1, minWidth: 140 }}>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="dress">Dress</option>
          <option value="outerwear">Outerwear</option>
          <option value="footwear">Footwear</option>
          <option value="accessory">Accessory</option>
        </select>
        <input
          placeholder="Color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          style={{ flex: 1, minWidth: 120 }}
        />
        <button className="btn primary" type="submit">Add Item</button>
      </form>

      {loading ? (
        <div className="empty-state">Loading your closet…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">Nothing logged yet — add your first item above.</div>
      ) : (
        <div className="grid-4">
          {items.map((item) => (
            <div className="card" key={item._id}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--thread)', marginBottom: 6 }}>
                {item.category.toUpperCase()}
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 6 }}>{item.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--bone-dim)', marginBottom: 10 }}>
                {item.color || '—'} · worn {item.timesWorn}×
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1, fontSize: 12, padding: '10px 12px' }} onClick={() => handleWorn(item._id)}>
                  Mark Worn
                </button>
                <button className="btn" style={{ fontSize: 12, padding: '10px 12px' }} onClick={() => handleDelete(item._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
