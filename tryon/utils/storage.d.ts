import { StorageData, UserSettings, TryOnMode } from "../types";
/**
 * Chrome Extension Storage abstraction layer
 * Provides type-safe operations over Chrome storage API
 */
export declare class ChromeStorage {
    private static readonly DEFAULT_TRY_ON_MODE;
    /**
     * Generic storage getter with type safety
     */
    private static promisify;
    static get<K extends keyof StorageData>(keys: K[]): Promise<Pick<StorageData, K>>;
    static set(data: Partial<StorageData>): Promise<void>;
    static remove(keys: (keyof StorageData)[]): Promise<void>;
    static clear(): Promise<void>;
    static getUserPhoto(): Promise<string | undefined>;
    static setUserPhoto(photoData: string): Promise<void>;
    static clearUserPhoto(): Promise<void>;
    static getApiKey(): Promise<string | undefined>;
    static setApiKey(apiKey: string): Promise<void>;
    static getSettings(): Promise<UserSettings>;
    static updateSettings(settings: Partial<UserSettings>): Promise<void>;
    static setSettings(settings: Partial<UserSettings>): Promise<void>;
    static getDefaultPrompt(): Promise<string | undefined>;
    static setDefaultPrompt(prompt: string): Promise<void>;
    static clearDefaultPrompt(): Promise<void>;
    static getTryOnMode(): Promise<TryOnMode>;
    static setTryOnMode(mode: TryOnMode): Promise<void>;
    static isConfigured(): Promise<boolean>;
    private static isValidDataUrl;
}
/**
 * Storage event listener utility
 */
export declare class StorageEventManager {
    static addChangeListener(callback: (changes: {
        [key: string]: chrome.storage.StorageChange;
    }) => void): void;
    static removeChangeListener(callback: (changes: {
        [key: string]: chrome.storage.StorageChange;
    }) => void): void;
}
/**
 * Storage quota and cleanup management
 */
export declare class StorageQuotaManager {
    private static readonly QUOTA_BYTES;
    private static readonly DEFAULT_THRESHOLD;
    private static readonly CLEANUP_EXPIRY_DAYS;
    static getUsage(): Promise<number>;
    static getQuota(): Promise<number>;
    static getUsagePercentage(): Promise<number>;
    static isNearLimit(threshold?: number): Promise<boolean>;
    static performCleanup(): Promise<{
        cleaned: boolean;
        itemsRemoved: string[];
    }>;
    static cleanup(): Promise<{
        cleaned: boolean;
        itemsRemoved: string[];
    }>;
}
export declare const onStorageChanged: typeof StorageEventManager.addChangeListener;
//# sourceMappingURL=storage.d.ts.map