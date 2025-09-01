/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Generates an edited image using generative AI based on a text prompt and a specific point.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export declare const generateEditedImage: (originalImage: File, userPrompt: string, hotspot: {
    x: number;
    y: number;
}) => Promise<string>;
/**
 * Generates an image with a filter applied using generative AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export declare const generateFilteredImage: (originalImage: File, filterPrompt: string) => Promise<string>;
/**
 * Generates an image with a global adjustment applied using generative AI.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export declare const generateAdjustedImage: (originalImage: File, adjustmentPrompt: string) => Promise<string>;
/**
 * Generates a virtual try-on image using Gemini AI.
 * @param userImage The user's image (as data URL string or File).
 * @param clothingImage The clothing image (as data URL string or File).
 * @param prompt Optional custom prompt for the try-on.
 * @returns A promise that resolves to the data URL of the try-on result.
 */
export declare const generateVirtualTryOn: (userImage: string | File, clothingImage: string | File, prompt?: string, tryOnMode?: string) => Promise<string>;
//# sourceMappingURL=gemini-service.d.ts.map