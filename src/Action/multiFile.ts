import * as vscode from "vscode";
import { readXML, writeXML, readDir } from "../../files/ioxml";
import { getCurrentShorts, getMissingShorts } from "../../lang/scripts/handleProvider";
import aLn from "../../lang/config/AnnoLanguages";

import { TextsTranslation } from "../../Component/modOp";

export async function _multiFile(filePath: string): Promise<void> {
	let _get: any;
	const loca = filePath.match("texts_(.*).xml")[1]; // current language
	if (typeof loca !== "string") {
		console.error("donkey");
		return;
	}
	const pXML = await readXML(filePath);

    let _cLang: string[] = [];
	for (const i of readDir(filePath)) {
		_cLang.push(i.match("texts_(.*).xml")[1]);
	}
	let _mLang = getMissingShorts(_cLang, getCurrentShorts([loca]));
	var filesDir =  _mLang

	const diffLang = await vscode.window
		.showInformationMessage("Do you want to recreate ALL other languages extept for " + loca + " ?", "Yes", "No")
		.then(answer => {
			if (answer === "Yes")
				// delete all other files first than get diff
				return getMissingShorts([loca], filesDir);
			else return getMissingShorts([loca], filesDir);
		});
	let config = vscode.workspace.getConfiguration("anno-modding-translator.defaultComment");
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Translation in progress...",
			cancellable: false
		},
		async (progress, token) => {
			if (config.enable) {
				_get = await TextsTranslation(
					pXML,
					diffLang.map(_short => aLn[_short]),
					config.text
				);
			} else {
				console.log("get here");
				_get = await TextsTranslation(
					pXML,
					diffLang.map(_short => aLn[_short])
				);
				console.log("get here2", _get);
			}
		}
	);
	console.log(_get);
	vscode.window.showWarningMessage("Translation complete, attempting to write file.");
	diffLang.forEach(_lang => {
		writeXML(filePath.substring(0, filePath.lastIndexOf("\\") + 1) + "texts_" + _lang + ".xml", _get[aLn[_lang]]);
	});
}
