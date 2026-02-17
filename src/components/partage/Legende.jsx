import { TYPE_STYLES, TYPE_LABELS } from '@/lib/utils/constants';


export default function Legende() {
    return (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            {Object.entries(TYPE_STYLES).map(([color, styles]) => (
                <div key={color} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                    <span className="text-[11px] text-gray-500">{TYPE_LABELS[color]}</span>
                </div>
            ))}
        </div>
    );
}