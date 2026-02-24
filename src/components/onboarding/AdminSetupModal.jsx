'use client';

import { ArrowRight, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import Modal from '@/components/partage/Modal';
import { Button } from '@/components/ui/button';

export default function AdminSetupModal({
    isOpen = false,
    missingStep = null,
    checklist = [],
    onGoToStep,
}) {
    if (!missingStep) return null;

    const pendingCount = checklist.filter((step) => !step.done).length;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => null}
            title="Configuration initiale requise"
            description={missingStep.description}
            size="lg"
            closeOnOverlayClick={false}
            showCloseButton={false}
            footer={
                <Button onClick={onGoToStep}>
                    {missingStep.actionLabel}
                    <ArrowRight className="w-4 h-4" />
                </Button>
            }
        >
            <div className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">
                                {missingStep.title}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                                {pendingCount} étape{pendingCount > 1 ? 's' : ''} restante
                                {pendingCount > 1 ? 's' : ''} avant usage complet.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    {checklist.map((step) => (
                        <div
                            key={step.key}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                                step.done
                                    ? 'border-emerald-100 bg-emerald-50/50'
                                    : 'border-gray-200 bg-white'
                            }`}
                        >
                            <span
                                className={`text-sm ${
                                    step.done ? 'text-emerald-800' : 'text-gray-700'
                                }`}
                            >
                                {step.label}
                            </span>
                            {step.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
}
