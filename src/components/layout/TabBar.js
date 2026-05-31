import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
const tabs = [
    { id: 'dashboard', icon: '◉', label: 'Dashboard', route: '/' },
    { id: 'steps', icon: '👣', label: 'Steps', route: '/steps' },
    { id: 'heart', icon: '❤️', label: 'Heart', route: '/heart' },
    { id: 'activity', icon: '🏃', label: 'Activity', route: '/activity' },
];
export function TabBar({ active }) {
    const navigate = useNavigate();
    return (_jsxs("nav", { className: "shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl", children: [_jsx("div", { className: "flex", children: tabs.map((t) => {
                    const isActive = t.id === active;
                    return (_jsxs("button", { onClick: () => navigate(t.route), className: `flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-1 text-[10px] font-medium transition-colors cursor-pointer border-none bg-transparent ${isActive ? 'text-green-500' : 'text-[var(--color-text)]'}`, children: [_jsx("span", { className: "text-xl leading-none", children: t.icon }), _jsx("span", { children: t.label })] }, t.id));
                }) }), _jsx("div", { className: "h-[env(safe-area-inset-bottom,0px)]" })] }));
}
