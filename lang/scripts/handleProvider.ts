import * as vscode from "vscode";

import aLn from "../config/AnnoLanguages";
import * as libreTranslate from "./Libre/LibreProvider";
import * as bingTranslate from "./Bing/bingProvider";
import * as wiki from "./wiktionary/wiktionaryProvider";

import * as visual from "../../message/messageHandler";

/**
 * @{string} .Lang  // _short
 * @{string} .Provider //BingTranslate, LibreTranslate, GoogleTranslate
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
	TranslateFrom: string = null
): Promise<string | undefined> {
	try {
		if (config.Provider == "BingTranslate") {
			var res = await bingTranslate.singleTranslate(TranslateText, TranslateTo, TranslateFrom);
		} else {
			var res = await libreTranslate.singleTranslate(TranslateText, TranslateTo, TranslateFrom);
		}
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
		const res: Response = await bingTranslate.multiTranslate(TranslateText, TranslateTo, TranslateFrom);
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
 *
 * @returns {Promise<string[]>}
 */

export function getMissingShorts(Languages: string[]): string[] {
	console.error("input", Languages);
	let _res: string[] = [];
	for (const item in aLn)
		if (Languages.indexOf(item) < 0) {
			_res.push(item);
		}
	//let _res = aLn.filter( (item : string) => Languages.indexOf(item) < 0);
	console.error("missing:", _res);
	return _res;
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
