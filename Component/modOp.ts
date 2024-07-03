import * as vscode from "vscode";

import { multiTranslate } from "../lang/scripts/handleProvider";

import { MET } from "bing-translate-api";

/**
 * @{string}.text
 * @{boolean}.enable
 * @{boolean}.sourceString
 */

var config: any = vscode.workspace.getConfiguration("amt.Comment");

vscode.workspace.onDidChangeConfiguration(e => {
	if (e.affectsConfiguration("amt.Comment")) {
		config = vscode.workspace.getConfiguration("amt.Comment");
	}
});

function addComments(CommentObject: any, _Text: string): void {
	if (typeof CommentObject.comment == "undefined" && (config.enable || config.sourceString)) {
		CommentObject.comment = [];
	}
	if (config.enable) {
		CommentObject.comment.push("<!--" + config.text + "-->");
	}
	if (config.sourceString) {
		CommentObject.comment.push("<!--" + _Text + "-->");
	}
}

function doTranslate(_object: any, _text: string): any {}

interface ModOp {
	Text: string | Array<any>;
	comment: string[];
	[key: string]: any;
}

interface ModOpsContainer {
	ModOps: {
		ModOp: ModOp[];
	};
	[key: string]: any;
}

export async function TextsTranslation(pXML: ModOpsContainer, loca: string[]): Promise<any> {
	let _pXML: { [key: string]: ModOpsContainer } = {};
	loca.forEach(el => (_pXML[el] = structuredClone(pXML)));
	if (Array.isArray(pXML.ModOps)) {
		console.error("Multiple ModOps detected! This is not working, and will not be translated!");
		return "";
	} else {
		if (Array.isArray(pXML.ModOps.ModOp)) {
			for (let [key, value] of Object.entries(pXML.ModOps.ModOp)) {
				switch (typeof value.Text) {
					case "string": {
						console.log("Translating: " + value.Text.substring(0, 20));
						if (value.Text.length == 0) {
							console.error("Empty Text detected skipping!");
						} else {
							let _get = await multiTranslate(value.Text, loca);
							/* let _get = await MET.translate(value.Text, null, loca, {
								translateOptions: {
									textType: "html" as unknown as object
								}
							}); */
							for (var i = 0; i < _get[0].translations.length; i++) {
								if (_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text != _get[0].translations[i].text) {
									_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text = _get[0].translations[i].text;
									//_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].comment.push(optComm);
									addComments(_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text, _get[0].translations[i].text);
								}
							}
						}
						break;
					}
					case "object": {
						value.Text = Array.isArray(value.Text) ? value.Text : [value.Text];
						for (let _TextIndex in value.Text) {
							console.log("Translating: " + value.Text[_TextIndex].Text.substring(0, 20));
							if (value.Text[_TextIndex].Text.length == 0) {
								console.error("Empty Text detected skipping!");
							} else {
								let _get = await multiTranslate(value.Text[_TextIndex].Text, loca);
								/* let _get = await MET.translate(value.Text[_TextIndex].Text, null, loca, {
									translateOptions: {
										// Explicitly set textType as `html`. Defaults to `plain`.
										textType: "html" as unknown as object
									}
								}); */
								for (var i = 0; i < _get[0].translations.length; i++) {
									if (_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].Text != _get[0].translations[i].text) {
										_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].Text = _get[0].translations[i].text;
										//_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].comment.push(optComm);
										addComments(
											_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].Text,
											_get[0].translations[i].text
										);
									}
								}
							}
						}
						break;
					}
					default:
						console.error("nothing");
						break;
				}
			}
		} else {
			console.error("no array");
		}
	}
	return _pXML;
}
