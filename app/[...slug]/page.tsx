import { redirect } from 'next/navigation'

export default async function SlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  
  if (!slug || slug.length === 0) {
    redirect('/')
  }
  
  console.log('[SlugPage] Raw slug:', slug)
  
  // Formato: /kick/coscu/twitch/coker -> ?s=coscu,coker&p=kick,twitch
  // Formato: /kick/coscu/twitch/coker/youtube/video123 -> ?s=coscu,coker,video123&p=kick,twitch,youtube
  const streamers: string[] = []
  const platforms: string[] = []
  
  // Parsear: [platform, username, platform, username, ...]
  for (let i = 0; i < slug.length; i += 2) {
    const platform = slug[i]?.toLowerCase()
    const username = slug[i + 1]
    
    console.log('[SlugPage] Parsing pair:', { i, platform, username })
    
    if (platform && username && ['kick', 'twitch', 'youtube'].includes(platform)) {
      platforms.push(platform)
      streamers.push(username)
    }
  }
  
  console.log('[SlugPage] Parsed result:', { streamers, platforms })
  
  if (streamers.length === 0) {
    redirect('/')
  }
  
  // Formato claro: ?s=usernames&p=platforms
  const redirectUrl = `/?s=${streamers.join(',')}&p=${platforms.join(',')}`
  console.log('[SlugPage] Redirecting to:', redirectUrl)
  redirect(redirectUrl)
}
