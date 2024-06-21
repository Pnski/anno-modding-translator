import * as vscode from "vscode";
import * as bt from "bing-translate-api";
import  aLn from '../../lang/validLang.json'
console.log(aLn.chinese);

/* Translate */
export async function getTranslation(litString: string, sOut: string, sIn?: string | null): Promise<string> {
	try {
		var res = bt.translate(litString, sIn, sOut);
		return (await res).translation;
	} catch (err) {
		console.error("Caught error in machinetranslation of "+litString+" due to unknown reason (internet related).");
		vscode.window.showErrorMessage("Caught error with translation of: " + litString);
		return litString;
	}
}
export async function getTranslations(litString: string | string[], sOut: string[], sIn?: string | null): Promise<any> {
	try {
		const res = await bt.MET.translate(litString, sIn, sOut);
		console.log(res);
		for (const [Lang, Text] of Object.entries(res[0].translations)) {
			console.log(Lang, Text);
		}
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage("Caught error with translation of: " + litString);
	}
}

export function LocaDiff(loca : string): string[] {
    var ttrans = [];
	for (const [key, value] of Object.entries(aLn)) {
		if (key !== loca) {
			ttrans.push(value);
		}
	}
    return [];
}