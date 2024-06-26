import LTSMirrors from "./libreConfig";

interface translationResult {
    detectedLanguage: {
        confidence: number,
        language: string
    },
    translatedText: string
}

/**
 * To translate
 *
 * @param {string} TranslateText content to be translated
 * @param {string} TranslateFrom source language code. `auto-detect` by default.
 * @param {string} TranslateTo target language code. `en` by default.
 *
 * @returns {Promise<string | undefined>}
 */

export async function singleTranslate(TranslateText: string, TranslateTo: string,TranslateFrom: string='auto') {
    for await (let _URL of LTSMirrors) {
        try {
            const res : translationResult = await fetch(_URL, {
                method: "POST",
                body: JSON.stringify({
                    q: TranslateText,
                    source: TranslateFrom,
                    target: ['en','ru','ja'],//TranslateTo,
                    format: "text",
                }),
                headers: { "Content-Type": "application/json" }
            }).then((res) => res.json() as Promise<translationResult> );
            return { text: res?.translatedText }
        } catch (err) {
            console.log(`Mirror failed: ${_URL} with the next error:\n\n> ${err}\n\nTrying with the next one...\n`);
        }
    }
    throw new Error("All libreTranslate mirrors failed. Please try again later.")
}