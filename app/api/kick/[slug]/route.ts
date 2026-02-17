import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug

    if (!slug) {
        return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    try {
        // Use kick.cx API which is reliable
        const res = await fetch(`https://api.kick.cx/v1/channels/${slug}`, {
            next: { revalidate: 3600 }
        })

        if (!res.ok) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
        }

        const data = await res.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Kick proxy error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
