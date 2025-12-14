export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Session {
    id?: string;
    session_id?: string;
    language: string;
    status: "active" | "closed";
    created_at: string;
}

export interface Transcription {
    _id: string;
    session_id: string;
    transcript: string;
    created_at: string;
}

export interface Translation {
    _id: string;
    transcription_id: string;
    transcript: string;
    translation: string;
    language: string;
    created_at: string;
}

export interface TranslationData {
    transcription: Transcription;
    translation: Translation | null;
}

export interface HistoryResponse {
    session_id: string;
    translations: Translation[];
    count: number;
}

export interface BroadcastStatus {
    language: string;
    session_id: string | null;
    status: "idle" | "starting" | "active" | "stopping";
    client_count: number;
    started_at?: string;
    audio_active?: boolean;
}

export interface BroadcastStartResponse {
    language: string;
    session_id: string;
    status: string;
    client_count: number;
    started_at: string;
    audio_active: boolean;
}

const API_BASE_URL = "";

export const ApiClient = {
    async createSession(language: string = "zh"): Promise<Session> {
        const response = await fetch(`${API_BASE_URL}/api/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language }),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as ApiResponse<Session & { session_id?: string }>;
        if (!json.success) throw new Error(json.message);
        // Normalize id
        const data = json.data;
        return {
            ...data,
            id: data.id || data.session_id || "",
        };
    },

    async getSessionStatus(sessionId: string): Promise<Session> {
        const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/status`);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as ApiResponse<Session & { session_id?: string }>;
        if (!json.success) throw new Error(json.message);
        // Normalize id
        const data = json.data;
        return {
            ...data,
            id: data.id || data.session_id || "",
        };
    },

    async getHistory(sessionId: string, limit?: number): Promise<Translation[]> {
        let url = `${API_BASE_URL}/api/translation/${sessionId}/all`;
        if (limit) {
            url += `?limit=${limit}`;
        }

        const response = await fetch(url);
        const json = (await response.json()) as ApiResponse<HistoryResponse>;
        if (!json.success) throw new Error(json.message);
        return json.data.translations;
    },

    getSSEEndpoint(sessionId: string): string {
        return `${API_BASE_URL}/api/sse/translation/${sessionId}`;
    },

    async getSystemHealth(): Promise<{ status: string; mongo_connected: boolean; ffmpeg_installed: boolean }> {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) throw new Error("Health check failed");
        const json = await response.json();
        return json;
    },

    // Broadcast API methods
    async getBroadcastStatus(language?: string): Promise<BroadcastStatus> {
        const url = language ? `${API_BASE_URL}/api/broadcast/status?language=${language}` : `${API_BASE_URL}/api/broadcast/status`;
        const response = await fetch(url);
        const json = (await response.json()) as ApiResponse<BroadcastStatus>;
        if (!json.success) throw new Error(json.message);
        return json.data;
    },

    async startBroadcast(language: string = "zh"): Promise<BroadcastStartResponse> {
        const response = await fetch(`${API_BASE_URL}/api/broadcast/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language }),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as ApiResponse<BroadcastStartResponse>;
        if (!json.success) throw new Error(json.message);
        return json.data;
    },

    async stopBroadcast(language: string = "zh"): Promise<{ language: string }> {
        const response = await fetch(`${API_BASE_URL}/api/broadcast/stop`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language }),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as ApiResponse<{ language: string }>;
        if (!json.success) throw new Error(json.message);
        return json.data;
    },

    // SSE endpoint for broadcast (recommended)
    getBroadcastSSEEndpoint(language: string): string {
        return `${API_BASE_URL}/api/sse/broadcast/${language}`;
    },

    // Legacy SSE endpoint for individual sessions
    getSessionSSEEndpoint(sessionId: string): string {
        return `${API_BASE_URL}/api/sse/translation/${sessionId}`;
    }
};
