/* Import Section
vscode - vscodestuf
bt translate with bing, no api key currently needed
node:fs - filesystem related stuff
path - path related stuff
fast-xml-parser RW XML <> json <> objects

json = buildin
*/
import * as vscode from "vscode";
import * as hModOp from "./Scripts/ModOp";
import * as hFiles from "./Scripts/Files";
import * as hTrans from "./Scripts/Translation";
import * as hHelper from "./Scripts/Helper";
import aLn from "./Scripts/languageMap";

async function ModInfo(filePath: string): Promise<any> {
	const pJson = await hFiles.readJson(filePath);
	// .Category .ModName .Description
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Translation in progress",
			cancellable: false
		},
		async (progress, token) => {
			var i: number = 0;
			progress.report({
				message: `${Math.trunc((i / 3) * 100)}%`,
				increment: 0
			});
			for (let jsonCat of ["Category", "ModName", "Description"]) {
				for (const [key, value] of Object.entries(pJson[jsonCat])) {
					if (value !== null) {
						pJson[jsonCat][key] = await hTrans.getTranslation(pJson[jsonCat][key], aLn[key.toLowerCase()]);
					}
				}
				i++;
				progress.report({
					message: `${Math.trunc((i / 3) * 100)}%`,
					increment: 100 / 3
				});
			}
		}
	);
	await hFiles.writeJSON(filePath, pJson);
	vscode.window.showInformationMessage("modinfo.json translated, check new values manually");
}

async function Texts(filePath: string): Promise<void> {
	var pXML = await hFiles.readXML(filePath);
	const loca = filePath.match("texts_(.*).xml")[1];
	if (typeof loca !== "string") {
		console.error("donkey");
		return;
	}
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Translation in progress...",
			cancellable: false
		},
		async (progress, token) => {
			pXML.ModOps.ModOp = await hModOp.gModOps(pXML.ModOps.ModOp, aLn[loca.toLowerCase()]);
		}
	);
	vscode.window.showWarningMessage("Translation complete, attempting to write file.");
	await hFiles.writeXML(filePath, pXML);
}

async function getOtherLanguages(filePath: string): Promise<void> {
	let _get: any;
	const loca = filePath.match("texts_(.*).xml")[1]; // current language
	if (typeof loca !== "string") {
		console.error("donkey");
		return;
	}
	const pXML = await hFiles.readXML(filePath);

	const diffLang = await vscode.window
		.showInformationMessage("Do you want to recreate ALL other languages extept for " + loca + " ?", "Yes", "No")
		.then(answer => {
			if (answer === "Yes")
				// delete all other files first than get diff
				return hHelper.getMLanguages([loca], hHelper.getCLanguages(aLn));
			else return hHelper.getALanguages(filePath, aLn)[1];
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
				_get = await hModOp._gModOps(
					pXML,
					diffLang.map(_short => aLn[_short]),
					config.text
				);
			} else {
				_get = await hModOp._gModOps(
					pXML,
					diffLang.map(_short => aLn[_short])
				);
			}
		}
	);
	vscode.window.showWarningMessage("Translation complete, attempting to write file.");
	diffLang.forEach(_lang => {
		hFiles.writeXML(filePath.substring(0, filePath.lastIndexOf("\\") + 1) + "texts_" + _lang + ".xml", _get[aLn[_lang]]);
	});
	return;

	console.log(hHelper.getALanguages(filePath, aLn)); // array found languages and diff languages

	//vscode.window.showWarningMessage("Translation complete, attempting to write file.");
	//await hFiles.writeXML(filePath, pXML);
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "anno-modding-translator" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.testingStuff", async (uri: vscode.Uri) => {
			var path = (uri ?? vscode.window.activeTextEditor.document.uri).fsPath;
			//console.log(hFiles.readDir(path));
			console.log(await hFiles.readXML(path));
			//console.log((config.enable)? config.text:null)
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.Modinfo", async (uri: vscode.Uri) => {
			// ModName
			// Description
			// activeTextEditor.document.fileName end with modinfo.json
			const jsonPath = (uri ?? vscode.window.activeTextEditor.document.uri).fsPath;
			await ModInfo(jsonPath);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.Texts", async (uri: vscode.Uri) => {
			const xmlPath = (uri ?? vscode.window.activeTextEditor.document.uri).fsPath;
			await Texts(xmlPath);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.getOtherLanguages", async (uri: vscode.Uri) => {
			const xmlPath = (uri ?? vscode.window.activeTextEditor.document.uri).fsPath;
			await getOtherLanguages(xmlPath);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.Inplace", async () => {
			const mSel = vscode.window.activeTextEditor.selection;
			if (mSel) {
				console.log(vscode.window.activeTextEditor.document.getText(mSel));
			} else {
				vscode.window.showErrorMessage("Nothing selected to translate!");
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
