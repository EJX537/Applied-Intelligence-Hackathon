import { jsx as _jsx } from "react/jsx-runtime";
const styles = {
    native: 'bg-green-500/10 border-green-500/40 text-green-500 dark:bg-green-500/8',
    pwa: 'bg-blue-500/10 border-blue-500/40 text-blue-500 dark:bg-blue-500/8',
    browser: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 dark:bg-yellow-500/8',
};
const labels = {
    native: '📱 PWAKit Native',
    pwa: '📲 Installed PWA',
    browser: '🌐 Browser',
};
export function ModeBadge({ mode }) {
    return (_jsx("span", { className: `inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${styles[mode]}`, children: labels[mode] }));
}
