import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsentStatus } from '../hooks/useConsentStatus';
export function ConsentScreen() {
    const { grantConsent } = useConsentStatus();
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {});
    const [submitting, setSubmitting] = useState(false);
    const handleAccept = async () => {
        if (submitting)
            return;
        setSubmitting(true);
        try {
            await grantConsent();
            const mealType = state.nextMealType ?? 'lunch';
            navigate('/camera', { replace: true, state: { mealType } });
        }
        catch {
            window.alert('Could not save consent. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "app-shell p-6 text-center", children: [_jsx("div", { className: "w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto my-6 mb-4 text-[48px]", children: "\uD83C\uDF7D" }), _jsx("h1", { className: "text-[22px] font-bold text-[#333333] mb-4", children: "How we use your meal photos" }), _jsxs("div", { className: "bg-white p-4 rounded-xl mb-6 text-left leading-relaxed", children: [_jsx("p", { className: "m-0 mb-2 text-[14px] text-[#333333]", children: "\u2022 Photos are sent to an AI service to identify food items." }), _jsx("p", { className: "m-0 mb-2 text-[14px] text-[#333333]", children: "\u2022 Photos are stored privately in your browser and our servers." }), _jsx("p", { className: "m-0 mb-2 text-[14px] text-[#333333]", children: "\u2022 Photos are never shared with third parties." }), _jsx("p", { className: "m-0 text-[14px] text-[#333333]", children: "\u2022 You can delete any photo from your meal log at any time." })] }), _jsx("button", { type: "button", onClick: handleAccept, disabled: submitting, "aria-label": "I understand, continue", className: `btn btn-primary${submitting ? ' btn-disabled' : ''}`, children: submitting ? 'Saving…' : 'I Understand — Continue' })] }));
}
