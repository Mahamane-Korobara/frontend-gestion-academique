'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuth from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import useAdminOnboardingStatus from '@/lib/hooks/useAdminOnboardingStatus';
import AdminSetupModal from '@/components/onboarding/AdminSetupModal';

function AdminOnboardingGuard() {
    const router = useRouter();
    const pathname = usePathname();
    const { loading, hasError, isInitialized, isReady, missingStep, checklist } =
        useAdminOnboardingStatus();

    const stepPath = missingStep?.href?.split('?')[0];
    const isOnStepPage = stepPath
        ? pathname?.startsWith(stepPath)
        : false;

    const shouldShowModal = Boolean(
        isInitialized &&
        !loading &&
        !hasError &&
        !isReady &&
        missingStep &&
        !isOnStepPage
    );

    return (
        <AdminSetupModal
            isOpen={shouldShowModal}
            missingStep={missingStep}
            checklist={checklist}
            onGoToStep={() => {
                if (missingStep?.href) router.push(missingStep.href);
            }}
        />
    );
}

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, hasRole, user, isHydrated } = useAuth();

    useEffect(() => {
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.overflow = previousBodyOverflow;
        };
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }
        if (user && !hasRole('admin')) {
            const userRole = user.role?.name;
            if (userRole === 'professeur') router.replace('/professeur/dashboard');
            else if (userRole === 'etudiant') router.replace('/etudiant/dashboard');
            else router.replace('/login');
        }
    }, [isHydrated, isAuthenticated, user, hasRole, router]);

    if (!isHydrated) return null;
    if (!isAuthenticated || !hasRole('admin')) return null;

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Sidebar Desktop */}
            <Sidebar />

            {/* Sidebar Mobile */}
            <MobileSidebar />

            {/* Zone de contenu principale */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>

            <AdminOnboardingGuard />
        </div>
    );
}
