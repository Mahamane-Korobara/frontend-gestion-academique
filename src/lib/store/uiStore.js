import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store pour gérer l'état de l'interface utilisateur
 * - Sidebar (ouvert/fermé)
 * - Theme (clair/sombre)
 * - Notifications sonneries
 * - Mobile (détecter si mobile ou non)
 * - Accessible partout dans l'app
 */
const useUIStore = create(
    persist(
        (set) => ({
            // Sidebar
            sidebarOpen: true,
            sidebarCollapsed: false,

            // Theme
            theme: 'light',

            // Mobile
            isMobile: false,

            // Actions Sidebar
            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            toggleSidebarCollapse: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

            // Actions Theme
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';

                    // Appliquer le theme au document
                    if (typeof window !== 'undefined') {
                        document.documentElement.classList.toggle('dark', newTheme === 'dark');
                    }

                    return { theme: newTheme };
                }),

            setTheme: (theme) => {
                // Appliquer le theme au document
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                }

                set({ theme });
            },

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
            // Ne persister que theme et sidebarCollapsed
            partialize: (state) => ({
                theme: state.theme,
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);

export default useUIStore;