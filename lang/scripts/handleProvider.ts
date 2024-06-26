import * as libreTranslate from "./Libre/LibreProvider";
import * as bingTranslate from "./Bing/bingProvider";

/**
 * To translate single entitity
 *
 * @param {string} TranslateText content to be translated
 * @param {string} TranslateTo target language code. `en` by default.
 * @param {string} TranslateFrom source language code. `auto-detect` by default.
 *
 * @returns {Promise<string | undefined>}
 */

export async function singleTranslate(
    TranslateText: string,
    TranslateTo: string = 'en',
    TranslateFrom: string = "auto"
): Promise<string | undefined> {
	return "";
}

/**
 * To translate single entitity
 *
 * @param {string} TranslateText content to be translated
 * @param {string[]} TranslateTo target language code. `en` by default.
 * @param {string} TranslateFrom source language code. `auto-detect` by default.
 *
 * @returns {Promise<string | undefined>}
 */

export async function multiTranslate(
    TranslateText: string,
    TranslateTo: string[] = ['en'],
    TranslateFrom: string = 'auto',
): Promise<any | undefined> {
	return {};
}

/**
 * To translate single entitity
 *
 * @param {string[]} TranslateText content to be translated
 * @param {string} TranslateTo target language code. `en` by default.
 * @param {string} TranslateFrom source language code. `auto-detect` by default.
 *
 * @returns {Promise<string[] | undefined>}
 */

export async function multiTextTranslate(
	TranslateText: string[],
    TranslateTo: string = 'en',
	TranslateFrom: string = 'auto'
): Promise<string[] | undefined> {
	return [];
}
