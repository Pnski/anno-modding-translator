import * as vscode from "vscode";

import aLn from "../config/AnnoLanguages";
import * as libreTranslate from "./Libre/LibreProvider";
import * as bingTranslate from "./Bing/bingProvider";

import * as visual from '../../message/messageHandler'

/**
 * @{string} .Lang
 * @{string} .Provider
 */

var config: any = vscode.workspace.getConfiguration("amt.Translation");

vscode.workspace.onDidChangeConfiguration(e => {
	if (e.affectsConfiguration("amt.Translation")) {
		config = vscode.workspace.getConfiguration("amt.Translation");
	}
});

interface Translation {
	to: string;
	text: string;
}

interface Response {
	translations?: Translation[];
}

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
	TranslateTo: string = config.Lang,
	TranslateFrom: string = "auto"
): Promise<string | undefined> {
	try {
		var res = bingTranslate.getTranslation(TranslateText, TranslateFrom, TranslateTo);
		return await res;
	} catch (err) {
		visual.visualError(TranslateText);
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
	TranslateTo: string[] = [config.Lang],
	TranslateFrom: string = "auto"
): Promise<any | undefined> {
	try {
		const res: Response = await bingTranslate.getTranslations(TranslateText, TranslateTo, TranslateFrom);
		var _text: { [key: string]: string } = {};
		for (const [Lang, Text] of Object.entries(res.translations)) _text[Text.to as string] = Text.text as string;
		console.log("text", _text);
		return _text;
	} catch (err) {
		visual.visualError(TranslateText);
	}
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
	TranslateTo: string = config.Lang,
	TranslateFrom: string = "auto"
): Promise<string[] | undefined> {
	return [];
}

/**
 * To translate single entitity
 *
 * @param {string[]} Languages content to be translated
 *
 * @returns {Promise<string[]>}
 */

export function getCurrentShorts(Languages: string[]): string[] {
	var aLn_List = [];
	for (const [key, value] of Object.entries(aLn)) {
		aLn_List.push(key);
	}
	return aLn_List;
}

/**
 * To translate single entitity
 *
 * @param {string[]} Languages content to be translated
 * @param {string[]} filesDir target language code. `en` by default.
 *
 * @returns {Promise<string[]>}
 */

export function getMissingShorts(Languages: string[], filesDir: string[]): string[] {
	return [];
}
/* 
export function getALanguages(filePath: string, aLn: { [key: string]: string }): string[][] {
	let _cLang: string[] = [];
	for (const i of readDir(filePath)) {
		_cLang.push(i.match("texts_(.*).xml")[1]);
	}
	let _mLang = getMLanguages(_cLang, getCLanguages(aLn));
	return [_cLang, _mLang];
} */
