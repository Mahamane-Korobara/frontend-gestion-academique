import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store pour gérer l'état de l'interface utilisateur
 * - Sidebar (ouvert/fermé)
 * - Mobile (détecter si mobile ou non)
 * - Accessible partout dans l'app
 */
const useUIStore = create(
    persist(
        (set) => ({
            // Sidebar
            sidebarOpen: true,
            sidebarCollapsed: false,

            // Mobile
            isMobile: false,

            // Actions Sidebar
            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            toggleSidebarCollapse: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

            // Actions Mobile
            setIsMobile: (isMobile) => set({ isMobile }),

            // Fermer sidebar automatiquement sur mobile
            closeSidebarOnMobile: () =>
                set((state) => {
                    if (state.isMobile) {
                        return { sidebarOpen: false };
                    }
                    return {};
                }),
        }),
        {
            name: 'ui-storage',
            // Ne persister que sidebarCollapsed (le thème n'existe plus)
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);

export default useUIStore;