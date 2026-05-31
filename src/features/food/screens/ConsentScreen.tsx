import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
import { colors } from '../constants/colors';
import type { MealType } from '../types';

interface LocationState {
  nextMealType?: MealType;
}

export function ConsentScreen() {
  const { grantConsent } = useConsentStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleAccept = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await grantConsent();
      const mealType = state.nextMealType ?? 'lunch';
      navigate('/camera', { replace: true, state: { mealType } });
    } catch {
      window.alert('Could not save consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell" style={{ padding: 24, textAlign: 'center' }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          background: colors.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '24px auto 16px',
          fontSize: 48,
        }}
      >
        🍽
      </div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 16,
        }}
      >
        How we use your meal photos
      </h1>
      <div
        style={{
          background: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          textAlign: 'left',
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: '0 0 8px', fontSize: 14, color: colors.text }}>
          • Photos are sent to an AI service to identify food items.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 14, color: colors.text }}>
          • Photos are stored privately in your browser and our servers.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 14, color: colors.text }}>
          • Photos are never shared with third parties.
        </p>
        <p style={{ margin: 0, fontSize: 14, color: colors.text }}>
          • You can delete any photo from your meal log at any time.
        </p>
      </div>
      <button
        type="button"
        onClick={handleAccept}
        disabled={submitting}
        aria-label="I understand, continue"
        className={`btn btn-primary${submitting ? ' btn-disabled' : ''}`}
      >
        {submitting ? 'Saving…' : 'I Understand — Continue'}
      </button>
    </div>
  );
}
