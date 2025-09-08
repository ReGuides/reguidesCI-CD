import { redirect } from 'next/navigation';

// Перенаправляем на страницу со всеми оружиями с открытием модалки
export default async function WeaponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Перенаправляем на страницу оружий с параметрами для открытия модалки
  redirect(`/weapons?modal=weapon&id=${id}`);
} 