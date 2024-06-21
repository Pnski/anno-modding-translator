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
	const loca = filePath.match("texts_(.*).xml")[1];
	if (typeof loca !== "string") {
		console.error("donkey");
		return;
	}
	
	//console.log(loca, ttrans);
	//var str = await hTrans.getTranslations(["Translation", "complete, attempting to write file."], ttrans);
	/* var pXML = await hFiles.readXML(filePath);
	const loca = filePath.match('texts_(.*)\.xml')[1];
	if (typeof(loca) !== 'string') {
		console.error('donkey');
		return;
	}
	await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Translation in progress',
          cancellable: false,
        },
        async (progress, token) => {
			for (var i = 0; i < pXML.ModOps.ModOp.length;i++) {
				if (pXML.ModOps.ModOp[i].Text !== undefined){
					var percent =  Math.trunc(i/pXML.ModOps.ModOp.length*100);
					progress.report({message : `${percent}%`, increment: 100/pXML.ModOps.ModOp.length});
					pXML.ModOps.ModOp[i].Text = await hTrans.getTranslation(pXML.ModOps.ModOp[i].Text,aLn[loca]);
				}
			}
       	}
    ) */
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "anno-modding-translator" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.testingStuff", () => {
			for (let [key, value] of Object.entries(aLn)) {
				console.log(typeof key, typeof value);
			}
			const str : string =  "Chinese";
		console.log(aLn[str.toLowerCase()])
		console.log("hello world");
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.Modinfo", async () => {
			// ModName
			// Description
			// activeTextEditor.document.fileName end with modinfo.json
			const jsonPath = vscode.window.activeTextEditor.document.fileName;
			await ModInfo(jsonPath);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.Texts", async () => {
			const xmlPath = vscode.window.activeTextEditor.document.fileName;
			await Texts(xmlPath);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("anno-modding-translator.getOtherLanguages", async (uri: vscode.Uri) => {
			const xmlPath = uri.fsPath ?? vscode.window.activeTextEditor.document.fileName;
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
