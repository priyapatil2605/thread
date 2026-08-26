import { useState } from 'react';
import api from '../api/client';

const OCCASIONS = ['casual', 'formal', 'business', 'evening', 'wedding', 'athletic', 'streetwear'];

export default function Outfits() {
  const [occasion, setOccasion] = useState('casual');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getSuggestion() {
    setLoading(true);
    try {
      const res = await api.get('/outfits/suggest', { params: { occasion } });
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 100 }}>
      <div className="page-head">
        <h1>Outfits, Styled By AI</h1>
        <p>Pick an occasion — the matcher scores the catalogue against your skin tone, undertone, body type and height.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={occasion} onChange={(e) => setOccasion(e.target.value)} style={{ maxWidth: 220 }}>
          {OCCASIONS.map((o) => (
            <option key={o} value={o} style={{ textTransform: 'capitalize' }}>
              {o[0].toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>
        <button className="btn primary" onClick={getSuggestion} disabled={loading}>
          {loading ? 'Matching…' : 'Suggest an Outfit'}
        </button>
      </div>

      {result && (
        <div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 20 }}>
            MATCH SCORE // {result.matchScore} · BASED ON: {Object.entries(result.basedOn)
              .filter(([, v]) => v)
              .map(([k, v]) => `${k}=${v}`)
              .join(', ') || 'no profile set'}
          </div>

          {result.outfit.length === 0 ? (
            <div className="empty-state">
              No strong matches yet — add more products via the seed script, or set your profile at signup.
            </div>
          ) : (
            <div className="grid-4">
              {result.outfit.map((p) => (
                <div className="card" key={p._id}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--thread)', marginBottom: 6 }}>
                    {p.category.toUpperCase()}
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 6 }}>{p.name}</h3>
                  <div style={{ color: 'var(--gold)', fontSize: 14 }}>${p.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
