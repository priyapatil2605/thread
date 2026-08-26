import { useRef, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './TryOnModal.css';

const LOADING_MESSAGES = [
  'Reading the garment…',
  'Mapping it to your photo…',
  'Rendering the fit…',
  'The free model can take a couple minutes if it\u2019s busy — hang tight…',
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TryOnModal({ product, onClose }) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(user?.profile?.photoUrl || null);
  const [saveForFuture, setSaveForFuture] = useState(!user?.profile?.photoUrl);
  const [status, setStatus] = useState('idle'); // idle | generating | done | error
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [messageIdx, setMessageIdx] = useState(0);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Photo is too large — please use one under 8MB.');
      return;
    }
    setError('');
    const dataUrl = await fileToDataUrl(file);
    setPhoto(dataUrl);
  }

  async function handleGenerate() {
    if (!photo) return;
    setStatus('generating');
    setError('');

    let msgTimer = setInterval(() => {
      setMessageIdx((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 6000);

    try {
      if (saveForFuture && photo !== user?.profile?.photoUrl) {
        updateProfile({ photoUrl: photo }).catch(() => {});
      }
      const res = await api.post('/tryon', { productId: product._id, userPhotoUrl: photo });
      setResultImageUrl(res.data.resultImageUrl);
      setStatus('done');
    } catch (err) {
      const data = err.response?.data;
      const detail = [data?.message, data?.error].filter(Boolean).join(' — ');
      setError(detail || 'Try-on failed — please try again.');
      setStatus('error');
    } finally {
      clearInterval(msgTimer);
      setMessageIdx(0);
    }
  }

  return (
    <div className="tryon-overlay" onClick={onClose}>
      <div className="tryon-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tryon-close" onClick={onClose} aria-label="Close">×</button>

        <div className="mono" style={{ fontSize: 11, color: 'var(--thread)', marginBottom: 6 }}>TRY ON</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, marginBottom: 24 }}>{product.name}</h2>

        {status === 'done' && resultImageUrl ? (
          <>
            <img src={resultImageUrl} alt={`${product.name} on you`} className="tryon-result-img" />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn" onClick={() => { setStatus('idle'); setResultImageUrl(null); }}>
                Try Again
              </button>
              <button className="btn primary" onClick={onClose} style={{ flex: 1 }}>
                Done
              </button>
            </div>
          </>
        ) : status === 'generating' ? (
          <div className="tryon-loading">
            <div className="tryon-spinner" />
            <p className="mono" style={{ fontSize: 12, color: 'var(--bone-dim)', marginTop: 20 }}>
              {LOADING_MESSAGES[messageIdx]}
            </p>
          </div>
        ) : (
          <>
            {photo ? (
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <img src={photo} alt="Your photo" className="tryon-preview-img" />
                <button className="btn" style={{ marginTop: 12, fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="tryon-upload-box" onClick={() => fileInputRef.current?.click()}>
                <p style={{ fontSize: 14, color: 'var(--bone-dim)' }}>Upload a clear, front-facing full-body photo</p>
                <span className="btn primary" style={{ marginTop: 14, display: 'inline-block' }}>Choose Photo</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

            {photo && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--bone-dim)', marginBottom: 20 }}>
                <input type="checkbox" checked={saveForFuture} onChange={(e) => setSaveForFuture(e.target.checked)} />
                Save this photo to my profile for future try-ons
              </label>
            )}

            {error && <div className="error-msg">{error}</div>}

            <button className="btn primary" disabled={!photo} onClick={handleGenerate} style={{ width: '100%' }}>
              Generate Try-On
            </button>
            <p style={{ fontSize: 11, color: 'var(--slate)', marginTop: 14, lineHeight: 1.6 }}>
              AI-generated — takes 15–60 seconds. Your photo is sent only to generate this preview.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
