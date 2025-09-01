export interface NanoBananaAPIResponse {
    success: boolean;
    output_image?: string;
    image_url?: string;
    error?: string;
    message?: string;
}
export interface NanoBananaAPIRequest {
    user_image: string;
    clothing_image: string;
    prompt: string;
    maintain_face?: boolean;
    maintain_pose?: boolean;
    quality?: "low" | "medium" | "high";
}
export type TryOnMode = "overall" | "direct";
export interface UserSettings {
    apiKey?: string;
    userPhoto?: string;
    lastUsed?: number;
    tryOnMode?: TryOnMode;
}
export interface TryOnMessage {
    action: "startTryOn";
    clothingImageUrl: string;
    userPhoto: string;
}
export interface ErrorMessage {
    action: "showError";
    message: string;
}
export interface SavePhotoMessage {
    action: "saveUserPhoto";
    photoData: string;
}
export interface SaveApiKeyMessage {
    action: "saveApiKey";
    apiKey: string;
}
export interface ProcessTryOnMessage {
    action: "processVirtualTryOn";
    userPhoto: string;
    clothingImageUrl?: string;
    clothingImage?: string;
    customPrompt?: string;
    tryOnMode?: TryOnMode;
}
export type ChromeMessage = TryOnMessage | ErrorMessage | SavePhotoMessage | SaveApiKeyMessage | ProcessTryOnMessage;
export interface APIResponse<T = unknown> {
    success: boolean;
    result?: T;
    error?: string;
}
export interface TryOnResult {
    imageUrl: string;
    timestamp: number;
    success: boolean;
}
export interface ContextMenuInfo {
    menuItemId: string;
    srcUrl: string;
}
export interface StorageData {
    userPhoto?: string;
    apiKey?: string;
    settings?: UserSettings;
    defaultPrompt?: string;
}
export interface ModalElement extends HTMLElement {
    remove(): void;
}
export interface NotificationOptions {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
}
//# sourceMappingURL=index.d.ts.map