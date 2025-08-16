'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  _id?: string;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
    metaKeywords?: string;
  };
  social: {
    telegram?: string;
    discord?: string;
    twitter?: string;
    youtube?: string;
    vk?: string;
  };
  features: {
    r34Mode: boolean;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    commentsEnabled: boolean;
    searchEnabled: boolean;
  };
  content: {
    maxCharactersPerPage: number;
    maxWeaponsPerPage: number;
    maxArtifactsPerPage: number;
    enableCharacterBuilds: boolean;
    enableWeaponComparison: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    birthdayReminders: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        } else {
          setError('Failed to fetch settings');
        }
      } else {
        setError('Failed to fetch settings');
      }
    } catch (err) {
      setError('Error fetching settings');
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  return {
    settings,
    loading,
    error,
    refreshSettings
  };
};
