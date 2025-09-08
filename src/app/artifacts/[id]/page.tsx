import { redirect } from 'next/navigation';

// Перенаправляем на страницу со всеми артефактами с открытием модалки
export default async function ArtifactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Перенаправляем на страницу артефактов с параметрами для открытия модалки
  redirect(`/artifacts?modal=artifact&id=${id}`);
}