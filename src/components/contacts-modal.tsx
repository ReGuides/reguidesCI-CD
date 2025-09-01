'use client';

import { useState, useEffect } from 'react';
import { X, Mail, MessageCircle, Globe, ExternalLink, Copy, Check } from 'lucide-react';

interface Contacts {
  email?: string;
  telegram?: string;
  discord?: string;
  vk?: string;
  website?: string;
  description?: string;
}

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
  const [contacts, setContacts] = useState<Contacts>({});
  const [loading, setLoading] = useState(true);
  const [copiedEmails, setCopiedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/contacts');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setContacts(result.contacts);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmails(prev => new Set(prev).add(email));
      
      // Сбрасываем статус копирования через 2 секунды
      setTimeout(() => {
        setCopiedEmails(prev => {
          const newSet = new Set(prev);
          newSet.delete(email);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy email:', error);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedEmails(prev => new Set(prev).add(email));
      setTimeout(() => {
        setCopiedEmails(prev => {
          const newSet = new Set(prev);
          newSet.delete(email);
          return newSet;
        });
      }, 2000);
    }
  };

  if (!isOpen) return null;

  const hasContacts = contacts.email || contacts.telegram || contacts.discord || contacts.vk || contacts.website;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-xl font-semibold text-white">Контакты</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : hasContacts ? (
            <div className="space-y-4">
              {contacts.description && (
                <p className="text-neutral-300 text-sm leading-relaxed">
                  {contacts.description}
                </p>
              )}

              <div className="space-y-3">
                {contacts.email && (
                  <button
                    onClick={() => copyEmail(contacts.email!)}
                    className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-white w-full text-left"
                  >
                    <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="flex-1">{contacts.email}</span>
                    {copiedEmails.has(contacts.email!) ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                )}

                {contacts.telegram && (
                  <a
                    href={contacts.telegram.startsWith('@') ? `https://t.me/${contacts.telegram.slice(1)}` : contacts.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-white"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="flex-1">{contacts.telegram}</span>
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </a>
                )}

                {contacts.discord && (
                  <a
                    href={contacts.discord.includes('discord.gg') ? contacts.discord : `https://discord.gg/${contacts.discord}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-white"
                  >
                    <MessageCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <span className="flex-1">{contacts.discord}</span>
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </a>
                )}

                {contacts.vk && (
                  <a
                    href={contacts.vk.includes('vk.com') ? contacts.vk : `https://vk.com/${contacts.vk}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-white"
                  >
                    <Globe className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="flex-1">{contacts.vk}</span>
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </a>
                )}

                {contacts.website && (
                  <a
                    href={contacts.website.startsWith('http') ? contacts.website : `https://${contacts.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-white"
                  >
                    <Globe className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="flex-1">{contacts.website}</span>
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-400">
                Контактная информация пока не настроена
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
