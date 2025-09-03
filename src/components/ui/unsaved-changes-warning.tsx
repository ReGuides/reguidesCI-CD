'use client';

import { AlertTriangle, Save, X } from 'lucide-react';
import { Button } from './button';

interface UnsavedChangesWarningProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  tabName: string;
}

export function UnsavedChangesWarning({
  isVisible,
  onSave,
  onDiscard,
  onCancel,
  tabName
}: UnsavedChangesWarningProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md border border-yellow-500/30">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Несохраненные изменения
            </h3>
                         <p className="text-gray-300 text-sm">
               У вас есть несохраненные изменения в разделе &quot;{tabName}&quot;. 
               Что вы хотите сделать?
             </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button
            onClick={onDiscard}
            variant="destructive"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Отменить
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-neutral-600 text-neutral-300 hover:bg-neutral-700"
          >
            Продолжить редактирование
          </Button>
        </div>
      </div>
    </div>
  );
}
