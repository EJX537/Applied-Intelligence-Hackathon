import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';

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
      navigate('../camera', { replace: true, state: { mealType } });
    } catch {
      window.alert('Could not save consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell p-6 text-center">
      <div
        className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto my-6 mb-4 text-[48px]"
      >
        🍽
      </div>
      <h1
        className="text-[22px] font-bold text-[#333333] mb-4"
      >
        How we use your meal photos
      </h1>
      <div
        className="bg-white p-4 rounded-xl mb-6 text-left leading-relaxed"
      >
        <p className="m-0 mb-2 text-[14px] text-[#333333]">
          • Photos are sent to an AI service to identify food items.
        </p>
        <p className="m-0 mb-2 text-[14px] text-[#333333]">
          • Photos are stored privately in your browser and our servers.
        </p>
        <p className="m-0 mb-2 text-[14px] text-[#333333]">
          • Photos are never shared with third parties.
        </p>
        <p className="m-0 text-[14px] text-[#333333]">
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
