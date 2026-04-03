'use client';

import ListPageLayout from '@/components/partage/ListPageLayout';
import MessagerieSection from '@/components/annonces/MessagerieSection';

export default function MessagesEtudiantPage() {
  return (
    <ListPageLayout
      title="Messages"
      description="Consultez vos conversations et échanges."
    >
      <MessagerieSection />
    </ListPageLayout>
  );
}
