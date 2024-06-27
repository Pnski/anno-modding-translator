import * as vscode from "vscode";
import { readFileSync, writeFile } from "fs";
import {multiTextTranslate} from '../../lang/scripts/handleProvider'
import aLn from "../../lang/config/AnnoLanguages";

function readJson(filePath: string): any {
	if (filePath.endsWith(".json")) {
		const loadedJSON = readFileSync(filePath, "utf-8");
		return JSON.parse(loadedJSON);
	} else {
		console.error("Not a JSON you donkey!");
		return {};
	}
}

async function writeJSON(filePath: string, pJson: any) {
	const data = new Uint8Array(Buffer.from(JSON.stringify(pJson, null, "\t")));
	await writeFile(filePath, data, err => {
		if (err) throw err;
		vscode.window.showInformationMessage("File has been saved!");
	});
}

export async function ModInfo(filePath: string): Promise<any> {
	const pJson = await readJson(filePath);
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
						pJson[jsonCat][key] = await multiTextTranslate(pJson[jsonCat][key], aLn[key.toLowerCase()]);
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
	await writeJSON(filePath, pJson);
	vscode.window.showInformationMessage("modinfo.json translated, check new values manually");
}
