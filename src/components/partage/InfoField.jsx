export default function InfoField({ icon: Icon, label, value, className = '' }) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <span className="text-xs text-gray-400 font-medium">{label}</span>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-h-9.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                <span className="text-sm text-gray-700 font-medium truncate">
                    {value || <span className="text-gray-400 font-normal italic">—</span>}
                </span>
            </div>
        </div>
    );
}