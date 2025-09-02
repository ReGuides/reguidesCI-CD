'use client';

import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
  suffix?: string;
}

export default function PageTitle({ title, suffix = 'ReGuides' }: PageTitleProps) {
  useEffect(() => {
    const fullTitle = suffix ? `${title} - ${suffix}` : title;
    document.title = fullTitle;
  }, [title, suffix]);

  return null; // Этот компонент не рендерит ничего в DOM
}
