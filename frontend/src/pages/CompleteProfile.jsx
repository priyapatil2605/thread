import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FIELD_HINT = {
  chestCm: 'Measure around the fullest part of your chest, tape level.',
  waistCm: 'Measure around your natural waistline, above the belly button.',
  hipCm: 'Measure around the fullest part of your hips.',
  shoulderCm: 'Measure across the back, seam to seam, shoulder point to shoulder point.',
};

export default function CompleteProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    heightCm: user?.profile?.heightCm || '',
    skinTone: user?.profile?.skinTone || '',
    undertone: user?.profile?.undertone || '',
    bodyType: user?.profile?.bodyType || '',
    gender: user?.profile?.gender || 'unspecified',
    chestCm: user?.profile?.measurements?.chestCm || '',
    waistCm: user?.profile?.measurements?.waistCm || '',
    hipCm: user?.profile?.measurements?.hipCm || '',
    shoulderCm: user?.profile?.measurements?.shoulderCm || '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const steps = [
    { key: 'styling', title: 'How should we style you?', fields: ['heightCm', 'skinTone', 'undertone', 'bodyType', 'gender'] },
    { key: 'measurements', title: 'Now, your measurements.', fields: ['chestCm', 'waistCm', 'hipCm', 'shoulderCm'] },
  ];
  const isLast = step === steps.length - 1;

  async function handleNext(e) {
    e.preventDefault();
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateProfile({
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        skinTone: form.skinTone || undefined,
        undertone: form.undertone || undefined,
        bodyType: form.bodyType || undefined,
        gender: form.gender || undefined,
        measurements: {
          chestCm: form.chestCm ? Number(form.chestCm) : undefined,
          waistCm: form.waistCm ? Number(form.waistCm) : undefined,
          hipCm: form.hipCm ? Number(form.hipCm) : undefined,
          shoulderCm: form.shoulderCm ? Number(form.shoulderCm) : undefined,
        },
      });
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 60, paddingBottom: 80 }}>
      <div className="mono" style={{ color: 'var(--thread)', fontSize: 12, marginBottom: 10 }}>
        STEP {step + 1} / {steps.length}
      </div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, marginBottom: 8 }}>
        {steps[step].title}
      </h1>
      <p style={{ color: 'var(--bone-dim)', fontSize: 14, marginBottom: 32 }}>
        {step === 0
          ? 'This is what drives outfit matching — nothing here is shown to anyone else.'
          : "Used for the tailor-style fit engine, so we can tell you exactly how a garment will sit on you before you buy it. Estimates are fine — you can refine these later in your profile."}
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div
            key={s.key}
            style={{
              height: 2,
              flex: 1,
              background: i <= step ? 'var(--thread)' : 'rgba(237,231,218,0.15)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      <form onSubmit={handleNext}>
        {step === 0 && (
          <>
            <div className="field">
              <label>Height (cm)</label>
              <input type="number" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} required />
            </div>
            <div className="field">
              <label>Skin Tone</label>
              <select value={form.skinTone} onChange={(e) => update('skinTone', e.target.value)} required>
                <option value="">Select…</option>
                <option value="fair">Fair</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="olive">Olive</option>
                <option value="tan">Tan</option>
                <option value="deep">Deep</option>
              </select>
            </div>
            <div className="field">
              <label>Undertone</label>
              <select value={form.undertone} onChange={(e) => update('undertone', e.target.value)} required>
                <option value="">Select…</option>
                <option value="warm">Warm</option>
                <option value="cool">Cool</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div className="field">
              <label>Body Type</label>
              <select value={form.bodyType} onChange={(e) => update('bodyType', e.target.value)} required>
                <option value="">Select…</option>
                <option value="slim">Slim</option>
                <option value="athletic">Athletic</option>
                <option value="average">Average</option>
                <option value="curvy">Curvy</option>
                <option value="plus">Plus</option>
              </select>
            </div>
            <div className="field">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="unspecified">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {['chestCm', 'waistCm', 'hipCm', 'shoulderCm'].map((key) => (
              <div className="field" key={key}>
                <label>{key.replace('Cm', '')} (cm)</label>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  required
                />
                <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6, lineHeight: 1.5 }}>
                  {FIELD_HINT[key]}
                </p>
              </div>
            ))}
          </>
        )}

        {error && <div className="error-msg">{error}</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {step > 0 && (
            <button type="button" className="btn" onClick={() => setStep((s) => s - 1)} style={{ flex: 1 }}>
              Back
            </button>
          )}
          <button className="btn primary" type="submit" disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Saving…' : isLast ? 'Finish' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
