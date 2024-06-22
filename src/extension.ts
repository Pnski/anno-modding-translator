/* Import Section
vscode - vscodestuf
bt translate with bing, no api key currently needed
node:fs - filesystem related stuff
path - path related stuff
fast-xml-parser RW XML <> json <> objects

json = buildin
*/
import * as vscode from "vscode";
//@ts-ignore
import * as hModOp from "./Scripts/ModOp";
//@ts-ignore
import * as hFiles from "./Scripts/Files";
//@ts-ignore
import * as hTrans from "./Scripts/Translation";
import * as hHelper from "./Scripts/Helper";

/* Global constant declaration 
aLn - Array with name, short [filename is always 'texts_+name+.xml'] no need to save
*/
/* for (const [key, value] of Object.entries(aLn)) {
		console.log(`${key}: ${value}`);
	} */
const aLn: { [key: string]: string } = {
	chinese: "zh-Hans",
	taiwanese: "zh-Hant",
	english: "en",
	french: "fr",
	german: "de",
	italian: "it",
	japanese: "ja",
	korean: "ko",
	polish: "pl",
	russian: "ru",
	spanish: "es"
};

//<Text>Euer &lt;font color='#ff80ffff'&gt;&lt;b&gt;[AssetData(1500001173) Text]&lt;/b&gt;&lt;/font&gt; hat erfolgreich &lt;img height='24' width='24' src="[AssetData(1010017) Icon]"/&gt; &lt;font overrideTextColor="true" color='#ff0000ff'&gt;&lt;b&gt;[AssetData(1010017) Text]&lt;/b&gt;&lt;/font&gt; gestohlen.</Text>
/* litString = text between <Text> AND </Text> */
//Euer &lt;font color='#ff80ffff'&gt;&lt;b&gt;[AssetData(1500001173) Text]&lt;/b&gt;&lt;/font&gt; hat erfolgreich &lt;img height='24' width='24' src="[AssetData(1010017) Icon]"/&gt; &lt;font overrideTextColor="true" color='#ff0000ff'&gt;&lt;b&gt;[AssetData(1010017) Text]&lt;/b&gt;&lt;/font&gt; gestohlen.
function cleanStrings(litString: string): [] {
	const regex = new RegExp("(&gt;)(.*?)(&lt;)", "gi");
	const nArray = [...litString.matchAll(regex)];
	for (var i = 0; i < nArray.length; i++) {
		console.log(nArray[i]);
	}
	return [];
}

async function parseTranslate(litString: string): Promise<any> {
	return;
}

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
	const loca = filePath.match("texts_(.*).xml")[1]; // current language
	const pXML = await hFiles.readXML(filePath);
	if (typeof loca !== "string") {
		console.error("donkey");
		return;
	}
	const diffLang = await vscode.window.showInformationMessage("Do you want to recreate ALL other languages extept for ${loca}?", "Yes", "No").then(answer => {
		if (answer === "Yes")
			// delete all other files first than get diff
			return (hHelper.getMLanguages([loca], hHelper.getCLanguages(aLn)));
		else 
			return (hHelper.getALanguages(filePath, aLn)[1]);
	});
	let _pXML = await hModOp.gMModOps(pXML.ModOps,diffLang);
	console.log("_pxmlout",_pXML);
	return;
	
	console.log(hHelper.getALanguages(filePath, aLn)); // array found languages and diff languages
	
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Translation in progress...",
			cancellable: false
		},
		async (progress, token) => {
			//pXML.ModOps.ModOp = await hModOp.gMModOps(pXML.ModOps.ModOp, diffLang);
		}
	);
	//vscode.window.showWarningMessage("Translation complete, attempting to write file.");
	//await hFiles.writeXML(filePath, pXML);
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "anno-modding-translator" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.testingStuff", async (uri: vscode.Uri) => {
			/* 	for (let [key, value] of Object.entries(aLn)) {
				console.log(typeof key, typeof value);
			}
			const str : string =  "Chinese";
		uri.path
		console.log(aLn[str.toLowerCase()])
		console.log("hello world"); */
			var path = (uri ?? vscode.window.activeTextEditor.document.uri).fsPath;
			//console.log(hFiles.readDir(path));
			const _t = await hTrans.getTranslations("deine mutter mag luftschiffe!", hHelper.getALanguages(path, aLn)[1]);
			console.error(_t);
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
