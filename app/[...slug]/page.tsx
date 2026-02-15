import { redirect } from 'next/navigation'

export default async function SlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const streamers = slug.join(',')
  redirect(`/?streamers=${streamers}`)
}
