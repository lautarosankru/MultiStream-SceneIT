import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug

    if (!slug) {
        return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    try {
        const res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; StreamWrapper/1.0; +http://localhost)'
            },
            next: { revalidate: 3600 }
        })

        if (!res.ok) {
            return NextResponse.json({ error: 'Kick API error' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Kick proxy error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
