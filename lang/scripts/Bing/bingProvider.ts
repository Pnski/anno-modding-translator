import * as vscode from "vscode";
import * as bt from "bing-translate-api";

const options = require("./bingConfig");

import * as visual from "../../../message/messageHandler";

/* interface translateOptions {
	textType : any
}

const options : translateOptions =  {
	textType: 'html'
} */

/**
 * To translate single entitity
 *
 * @param {string} TranslateText content to be translated
 * @param {string} TranslateTo target language code. `en` by default.
 * @param {string} TranslateFrom source language code. `auto-detect` by default.
 *
 * @returns {Promise<string | undefined>}
 */

export async function singleTranslate(TranslateText: string, TranslateTo: string, TranslateFrom?: string | null): Promise<string> {
	try {
		var res = bt.translate(TranslateText, TranslateFrom, TranslateTo);
		return (await res).translation;
	} catch (err) {
		console.error("Caught error in machinetranslation of " + TranslateText + " due to unknown reason (internet related).");
		vscode.window.showErrorMessage("Caught error with translation of: " + TranslateText);
		return TranslateText;
	}
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
	TranslateTo: string[],
	TranslateFrom?: string | null
): Promise<{ [key: string]: string }> {
	try {
		const res = await bt.MET.translate(TranslateText, TranslateFrom, TranslateTo);
		var _text: { [key: string]: string } = {};
		for (const [Lang, Text] of Object.entries(res[0].translations)) _text[Text.to] = Text.text;
		console.log("text", _text);
		return _text;
	} catch (err) {
		visual.visualError(TranslateText);
	}
}
