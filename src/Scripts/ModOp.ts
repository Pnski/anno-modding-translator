import * as vscode from "vscode";
import * as hTrans from "./Translation";
import { Http2ServerRequest } from "http2";

async function tText(Text: any, loca: string): Promise<string> {
	if (typeof Text == "string") {
		return await hTrans.getTranslation(Text, loca);
	} else {
		return "";
	}
}

async function gTexts(Texts: any, loca: string): Promise<string> {
	switch (typeof Texts) {
		case "string": {
			// single Text
			return await tText(Texts, loca);
		}
		case "object": {
			// Nested Texts
			if (typeof Texts.length == "undefined") {
				return await tText(Texts.Text, loca);
			} else {
				for (var i = 0; i < Texts.length; i++) {
					console.log("Translating multiple lines in ModOp [" + i + " / " + Texts.length + "]:", Texts[i].Text.substr(0, 20).concat(" ..."));
					Texts[i].Text = await tText(Texts[i].Text, loca);
				}
				return await Texts;
			}
		}
		default: {
			vscode.window.showWarningMessage("Error Text not found in ModOp! Returning emtpy Text!");
			return "";
		}
	}
}

export async function gModOps(ModOp: any, loca: string): Promise<any> {
	if (typeof ModOp == "undefined") {
		vscode.window.showWarningMessage("Error ModOp not found in ModOps!");
	} else {
		if (typeof ModOp.length == "undefined") {
			//single ModOp
			ModOp = await gTexts(ModOp.Text, loca);
			return ModOp;
		} else {
			// multi ModOp
			for (var i = 0; i < ModOp.length; i++) {
				ModOp[i].Text = await gTexts(ModOp[i].Text, loca);
			}
			return await ModOp;
		}
	}
}

async function tMText(Text: any, loca: string[]): Promise<{ [key: string]: string }> {
	console.log("translating");
	if (typeof Text == "string") {
		let _get = await hTrans.getTranslations(Text, loca);
		let _MText: { [key: string]: string } = {};
		for (const l of loca) {
			_MText[l] = _get[l];
		}
		return _MText;
	} else {
		return {};
	}
}

export async function gMModOps(ModOp: any, loca: string[]): Promise<any> {
	if (typeof ModOp == "undefined") {
		vscode.window.showWarningMessage("Error ModOp not found in ModOps!");
	} else {
		var _ModOp: { [key: string]: any } = {};
		loca.forEach(lang => _ModOp[lang] = ModOp);
		//ModOp original language - translate to all languages from diffLang
		//returns ModOp[difflang] array
		let _get : { [key: string]: string } = {};//error_get.push(hTrans.getTranslations(element.Text,loca)
		//ModOp.ModOp.forEach(element => (true));
		for (let items of ModOp.ModOp){
			var i = await hTrans.getTranslations(items.Text,loca);
			for (const l in i){
				_get[l] = i[l];
			}
		}
		console.log("get",_get);
	}
}