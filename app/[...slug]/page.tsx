import { redirect } from 'next/navigation'
import { parseSlugs } from '@/lib/streamers'

export default async function SlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  
  // Generate friendly URL path: /kick/coscu/twitch/coker
  const streamers = parseSlugs(slug)
  
  if (streamers.length === 0) {
    redirect('/')
  }
  
  // Build friendly URL path: /platform/username/platform/username
  const pathParts: string[] = []
  for (const streamer of streamers) {
    pathParts.push(streamer.platform.toLowerCase())
    pathParts.push(streamer.username.toLowerCase())
  }
  
  const friendlyPath = '/' + pathParts.join('/')
  redirect(friendlyPath)
}
