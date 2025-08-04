'use client';

import React from 'react';
import { X, Star } from 'lucide-react';

interface Constellation {
  name: string;
  level: number;
  description: string;
  effect?: string;
}

interface ConstellationModalProps {
  constellation: Constellation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConstellationModal({ constellation, isOpen, onClose }: ConstellationModalProps) {
  if (!isOpen || !constellation) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{constellation.name}</h2>
                <span className="px-3 py-1 rounded text-sm font-medium text-purple-400 bg-purple-900/30 border border-purple-700">
                  C{constellation.level}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-neutral-800 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Описание */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Описание</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {constellation.description}
              </p>
            </div>

            {/* Эффект */}
            {constellation.effect && (
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Эффект</h3>
                <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {constellation.effect}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 