/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE?: string;
	readonly VITE_YANDEX_MAPS_API_KEY?: string;
	readonly VITE_TELEGRAM_BOT_TOKEN?: string;
	readonly VITE_TELEGRAM_CHAT_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
