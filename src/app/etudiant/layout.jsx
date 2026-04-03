import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';

export const metadata = {
  title: 'Espace Étudiant',
  description: 'Interface de suivi pour les étudiants',
};

export default function EtudiantLayout({ children }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Sidebar Mobile */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
