import { redirect } from 'next/navigation'

export default async function SlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  
  // Si no hay slug, ir a home
  if (!slug || slug.length === 0) {
    redirect('/')
  }
  
  // Convertir /kick/coscu/twitch/coker a ?streamers=kick,coscu,twitch,coker
  // Esto evita el loop infinito porque usa query params
  const streamersParam = slug.join(',')
  
  redirect(`/?streamers=${streamersParam}`)
}
