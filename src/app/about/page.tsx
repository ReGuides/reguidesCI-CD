'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IAbout, Feature, TeamMember } from '@/lib/db/models/About';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function AboutPage() {
  const [about, setAbout] = useState<IAbout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/about');
        
        if (!response.ok) {
          throw new Error('Failed to load about page');
        }
        
        const data = await response.json();
        setAbout(data);
      } catch (error) {
        console.error('Error loading about page:', error);
        setError('Ошибка при загрузке страницы');
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  const renderFeature = (feature: Feature) => (
    <div key={feature.title} className="bg-neutral-800 border border-neutral-700 p-6 rounded-xl hover:bg-neutral-750 transition-colors">
      <div className="flex items-start gap-4">
        {feature.icon && (
          <div className="flex-shrink-0 text-3xl">
            {feature.icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
          <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </div>
  );

  const renderTeamMember = (member: TeamMember) => (
    <div key={member.name} className="bg-neutral-800 border border-neutral-700 p-6 rounded-xl hover:bg-neutral-750 transition-colors">
      <div className="text-center">
        {member.avatar && (
          <Image 
            src={member.avatar.startsWith('http') ? member.avatar : `/images/avatars/${member.avatar}`}
            alt={member.name} 
            width={80}
            height={80}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
        <p className="text-blue-400 font-medium mb-2">{member.role}</p>
        {member.description && (
          <p className="text-neutral-400 text-sm mb-4">{member.description}</p>
        )}
        <div className="flex justify-center gap-3">
          {member.social?.github && (
            <a 
              href={member.social.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          )}
          {member.social?.telegram && (
            <a 
              href={member.social.telegram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Telegram
            </a>
          )}
          {member.social?.discord && (
            <a 
              href={member.social.discord} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Discord
            </a>
          )}
          {member.social?.website && (
            <a 
              href={member.social.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="md" className="text-blue-500" />
        <span className="ml-3 text-neutral-400">Загрузка страницы...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Ошибка загрузки</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!about) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-white mb-2">Страница не найдена</h1>
          <p className="text-neutral-400">Страница &quot;О проекте&quot; пока не создана</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{about.title}</h1>
          {about.subtitle && (
            <p className="text-xl text-neutral-400 mb-6">{about.subtitle}</p>
          )}
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-neutral-300 leading-relaxed">{about.description}</p>
          </div>
        </div>

        {/* Statistics */}
        {about.statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{about.statistics.characters}</div>
              <div className="text-neutral-400">Персонажей</div>
            </div>
            <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{about.statistics.weapons}</div>
              <div className="text-neutral-400">Оружий</div>
            </div>
            <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{about.statistics.artifacts}</div>
              <div className="text-neutral-400">Артефактов</div>
            </div>
            <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{about.statistics.builds}</div>
              <div className="text-neutral-400">Сборок</div>
            </div>
          </div>
        )}

        {/* Features */}
        {about.features && about.features.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Возможности</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.features
                .sort((a, b) => a.order - b.order)
                .map(renderFeature)}
            </div>
          </div>
        )}

        {/* Team */}
        {about.team && about.team.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Наша команда</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.team
                .sort((a, b) => a.order - b.order)
                .map(renderTeamMember)}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {about.contactInfo && (
          <div className="bg-neutral-800 border border-neutral-700 p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Связаться с нами</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {about.contactInfo.email && (
                <a 
                  href={`mailto:${about.contactInfo.email}`}
                  className="flex items-center justify-center gap-2 p-4 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <span className="text-2xl">📧</span>
                  <span className="text-white">Email</span>
                </a>
              )}
              {about.contactInfo.telegram && (
                <a 
                  href={about.contactInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-white">Telegram</span>
                </a>
              )}
              {about.contactInfo.discord && (
                <a 
                  href={about.contactInfo.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <span className="text-2xl">💬</span>
                  <span className="text-white">Discord</span>
                </a>
              )}
              {about.contactInfo.github && (
                <a 
                  href={about.contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <span className="text-2xl">🐙</span>
                  <span className="text-white">GitHub</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Support Project */}
        {about.supportProject && (
          <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Поддержать проект</h2>
            <div 
              className="text-neutral-300 text-center"
              dangerouslySetInnerHTML={{ __html: about.supportProject }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 