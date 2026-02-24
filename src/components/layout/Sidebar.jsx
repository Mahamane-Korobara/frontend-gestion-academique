'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, GraduationCap, Network, BarChart3, 
  Settings, BookMarked, Calendar, FileText, MessageSquare, 
  File, ClipboardCheck, TrendingUp, CheckCircle, Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import useAuthStore from '@/lib/store/authStore';
import useUIStore from '@/lib/store/uiStore';
import { APP_NAME } from '@/lib/utils/constants';

const MENU_CONFIG = {
  admin: [
    { title: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard' },
    {
      section: 'GESTION',
      items: [
        { title: 'Utilisateurs', icon: Users, href: '/utilisateurs' },
        { title: 'Filières & Niveaux', icon: Network, href: '/filieres-niveaux' },
        { title: 'Matières & Cours', icon: BookMarked, href: '/matieres-cours' },
        { title: 'Emploi du Temps global', icon: Calendar, href: '/emploi-du-temps'},
        { title: 'Cycles Académiques', icon: Calendar, href: '/annees-academiques' },
        { title: 'Evaluations & Barèmes', icon: TrendingUp, href: '/evaluations' },
        { title: 'Validation des Notes', icon: CheckCircle, href: '/notes' },
        { title: 'Communication', icon: Megaphone, href: '/annonces' },
      ],
    },
    {
      section: 'ADMINISTRATION',
      items: [
        { title: 'Rapports', icon: BarChart3, href: '/rapports' },
        { title: 'Paramètres', icon: Settings, href: '/parametres' },
      ],
    },
  ],
  professeur: [
    { title: 'Tableau de bord', icon: LayoutDashboard, href: '/professeur/dashboard' },
    {
      section: 'ENSEIGNEMENT',
      items: [
        { title: 'Mes Cours', icon: BookMarked, href: '/professeur/mes-cours' },
        { title: 'Notes', icon: ClipboardCheck, href: '/professeur/notes' },
        { title: 'Emploi du Temps', icon: Calendar, href: '/professeur/emploi-du-temps' },
      ],
    },
    {
      section: 'COMMUNICATION',
      items: [
        { title: 'Communication', icon: FileText, href: '/professeur/annonces' },
        { title: 'Documents', icon: File, href: '/professeur/documents' },
      ],
    },
  ],
  etudiant: [
    { title: 'Tableau de bord', icon: LayoutDashboard, href: '/etudiant/dashboard' },
    {
      section: 'MES ÉTUDES',
      items: [
        { title: 'Mes Notes', icon: ClipboardCheck, href: '/etudiant/mes-notes' },
        { title: 'Mes Bulletins', icon: FileText, href: '/etudiant/mes-bulletins' },
        { title: 'Mes Cours', icon: BookMarked, href: '/etudiant/mes-cours' },
        { title: 'Emploi du Temps', icon: Calendar, href: '/etudiant/emploi-du-temps' },
      ],
    },
    {
      section: 'COMMUNICATION',
      items: [
        { title: 'Annonces', icon: FileText, href: '/etudiant/annonces' },
        { title: 'Messages', icon: MessageSquare, href: '/etudiant/messages' },
        { title: 'Documents', icon: File, href: '/etudiant/documents' },
      ],
    },
  ],
};

export default function Sidebar({ isMobile = false }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggleSidebar, sidebarOpen } = useUIStore();

  const handleLinkClick = () => {
    if (sidebarOpen && isMobile) toggleSidebar();
  };

  const role = user?.role?.name;
  const menuItems = MENU_CONFIG[role] || [];

  // Fonction pour vérifier si le lien est actif (exact pour dashboard, sinon commence par)
  const isLinkActive = (href) => {
    if (href.endsWith('/dashboard')) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "flex flex-col border-r bg-card h-screen sticky top-0 overflow-hidden",
      !isMobile && "hidden lg:flex lg:w-64" 
    )}>
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{APP_NAME}</p>
            <p className="text-[10px] text-muted-foreground capitalize truncate">{role} Panel</p>
          </div>
        </div>
      </div>

     <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
        <nav className="space-y-6 px-3 py-6">
          {menuItems.map((item, index) => (
            <div key={index}>
              {/* Liens hors sections (ex: Dashboard) */}
              {item.href && (
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isLinkActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              )}

              {/* Liens dans les sections (ex: Utilisateurs) */}
              {item.section && (
                <div className="space-y-1">
                  <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {item.section}
                  </p>
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        isLinkActive(subItem.href)
                          ? 'bg-primary text-primary-foreground' // Changé bg-accent par bg-primary pour avoir le bleu
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <subItem.icon className="w-4 h-4" />
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t shrink-0 bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}