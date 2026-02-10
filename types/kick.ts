export interface KickUser {
    id: number;
    username: string;
    slug: string;
    profile_pic: string | null;
}

export interface KickBadge {
    type: string;
    text: string;
    active: boolean;
}

export interface KickSender {
    id: number;
    username: string;
    slug: string;
    identity: {
        color: string;
        badges: KickBadge[];
    };
}

export interface KickChatMessage {
    id: string;
    chatroom_id: number;
    content: string;
    type: string;
    created_at: string;
    sender: KickSender;
}

export interface KickChannelData {
    id: number;
    slug: string;
    chatroom: {
        id: number;
        created_at: string;
        updated_at: string;
    };
}
