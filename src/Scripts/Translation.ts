import * as vscode from "vscode";
import * as bt from "bing-translate-api";

/* Translate */
export async function getTranslation(litString: string, sOut: string, sIn?: string | null): Promise<string> {
	try {
		var res = bt.translate(litString, sIn, sOut);
		return (await res).translation;
	} catch (err) {
		console.error("Caught error in machinetranslation of " + litString + " due to unknown reason (internet related).");
		vscode.window.showErrorMessage("Caught error with translation of: " + litString);
		return litString;
	}
}
export async function getTranslations(litString: string, sOut: string[], sIn?: string | null): Promise<{ [key: string]: string }> {
	try {
		const res = await bt.MET.translate(litString, sIn, sOut);
		var _text : { [key: string]: string } = {};
		for (const [Lang, Text] of Object.entries(res[0].translations)) 
			_text[Text.to] = (Text.text)
		console.log("text",_text);
		return _text;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage("Caught error with translation of: " + litString);
	}
}
