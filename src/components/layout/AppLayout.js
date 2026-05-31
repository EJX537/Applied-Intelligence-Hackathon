import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import { usePwaMode } from '../../hooks/usePwaMode';
import { ModeBadge } from '../ModeBadge';
import { TabBar } from './TabBar';
// Map pathname to tab id
function pathToTab(pathname) {
    const p = pathname.replace(/^\/#?/, '').split('/')[0];
    if (p === 'steps')
        return 'steps';
    if (p === 'food')
        return 'food';
    return 'dashboard';
}
export function AppLayout({ children }) {
    const mode = usePwaMode();
    const loc = useLocation();
    const activeTab = pathToTab(loc.pathname);
    return (_jsxs("div", { className: "absolute inset-0 flex flex-col overflow-hidden", children: [_jsxs("header", { className: "shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl", children: [_jsx("div", { className: "h-[env(safe-area-inset-top,0px)]" }), _jsxs("div", { className: "flex items-center justify-between px-4 h-12", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("span", { className: "text-base leading-none", children: "\uD83D\uDC9A" }), _jsx("h1", { className: "text-base font-semibold text-[var(--color-text-h)] tracking-tight m-0", children: "Step Counter" })] }), activeTab === 'dashboard' && _jsx(ModeBadge, { mode: mode })] })] }), _jsx("main", { className: "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4", children: children }), _jsx(TabBar, { active: activeTab })] }));
}
