import { redirect } from 'next/navigation'

export default async function SlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  
  if (!slug || slug.length === 0) {
    redirect('/')
  }
  
  // Formato: /kick/coscu/twitch/coker -> ?s=coscu,coker&p=kick,twitch
  // Formato: /kick/coscu/twitch/coker/youtube/video123 -> ?s=coscu,coker,video123&p=kick,twitch,youtube
  const streamers: string[] = []
  const platforms: string[] = []
  
  // Parsear: [platform, username, platform, username, ...]
  for (let i = 0; i < slug.length; i += 2) {
    const platform = slug[i]?.toLowerCase()
    const username = slug[i + 1]
    
    if (platform && username && ['kick', 'twitch', 'youtube'].includes(platform)) {
      platforms.push(platform)
      streamers.push(username)
    }
  }
  
  if (streamers.length === 0) {
    redirect('/')
  }
  
  const redirectUrl = `/?s=${streamers.join(',')}&p=${platforms.join(',')}&layoutMode=auto`
  redirect(redirectUrl)
}
