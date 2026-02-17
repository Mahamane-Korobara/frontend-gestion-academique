export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border border-gray-200">
            <span className="text-5xl">🗓️</span>
            <p className="text-sm font-medium text-gray-500">Aucun créneau pour ce filtre</p>
            <p className="text-xs text-gray-300">Modifiez les filtres ou créez des créneaux</p>
        </div>
    );
}
