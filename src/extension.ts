/* Import Section
vscode - vscodestuf
bt translate with bing, no api key currently needed
node:fs - filesystem related stuff
path - path related stuff
fast-xml-parser RW XML <> json <> objects

json = buildin
*/
import * as vscode from "vscode";
import * as bt from "bing-translate-api";
import { writeFile, readFile, writeFileSync, readFileSync } from "node:fs";
import * as path from "path";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import { title } from "node:process";
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

/* read files */
async function readJson(filePath: string): Promise<any> {
	if (filePath.endsWith(".json")) {
		const loadedJSON = await readFileSync(filePath, "utf-8");
		return JSON.parse(loadedJSON);
	} else {
		console.error("Not a JSON you donkey!");
		return false;
	}
}

async function readXML(filePath: string): Promise<any> {
	/* options for XMLParser */
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: "@@",
		format: true,
		commentPropName: "#comment"
	};
	const parser = new XMLParser(options);
	if (filePath.endsWith(".xml")) {
		const loadedXML = await readFileSync(filePath, "utf-8");
		let parsedXML = parser.parse(loadedXML);
		return parsedXML;
	} else {
		console.error("Not a XML you donkey!");
		return false;
	}
}

/* write files */
async function writeJSON(filePath: string, pJson: any): Promise<void> {
	const data = new Uint8Array(Buffer.from(JSON.stringify(pJson, null, "\t")));
	writeFile(filePath, data, err => {
		if (err) throw err;
		vscode.window.showInformationMessage("File has been saved!");
	});
}

async function writeXML(filePath: string, pXML: any): Promise<boolean> {
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: "@@",
		format: true,
		commentPropName: "#comment"
	};

	const builder = new XMLBuilder(options);
	const xmlOutput = builder.build(pXML).replaceAll("&apos;", "'").replaceAll("&quot;", '"');
	await writeFileSync(filePath, xmlOutput);
	return true;
}

/* Translate */
async function getTranslation(litString: string, sOut: string, sIn?: string | null): Promise<string> {
	try {
		var res = bt.translate(litString, sIn, sOut);
		return (await res).translation;
	} catch (err) {
		console.error("Caught error in machinetranslation of "+litString+" due to unknown reason (internet related).");
		vscode.window.showErrorMessage("Caught error with translation of: " + litString);
		return litString;
	}
}
async function getTranslations(litString: string | string[], sOut: string[], sIn?: string | null): Promise<any> {
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
						pJson[jsonCat][key] = await getTranslation(pJson[jsonCat][key], aLn[key.toLowerCase()]);
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

async function tText(Text : any, loca:string):Promise<string> {
	if (typeof Text == 'string'){
		return await getTranslation(Text, loca);
	} else {
		return '';
	}
}

async function gTexts(Texts: any, loca : string): Promise<any> {
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
					console.log("Translating multiple lines in ModOp ["+i+" / "+Texts.length+"]:", Texts[i].Text.substr(0,20).concat(' ...'));
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

async function gModOps(ModOp: any, loca : string): Promise<any> {
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

async function Texts(filePath: string): Promise<void> {
	var pXML = await readXML(filePath);
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
			pXML.ModOps.ModOp = await gModOps(pXML.ModOps.ModOp, aLn[loca.toLowerCase()]);
		}
	);
	vscode.window.showWarningMessage("Translation complete, attempting to write file.");
	await writeXML(filePath, pXML);
}

async function getOtherLanguages(filePath: string): Promise<void> {
	const loca = filePath.match("texts_(.*).xml")[1];
	if (typeof loca !== "string") {
		console.error("donkey");
		return;
	}
	var ttrans = [];
	for (const [key, value] of Object.entries(aLn)) {
		if (key !== loca) {
			ttrans.push(value);
		}
	}
	console.log(loca, ttrans);
	var str = await getTranslations(["Translation", "complete, attempting to write file."], ttrans);
	/* var pXML = await readXML(filePath);
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
					pXML.ModOps.ModOp[i].Text = await getTranslation(pXML.ModOps.ModOp[i].Text,aLn[loca]);
				}
			}
       	}
    ) */
}

export function activate(context: vscode.ExtensionContext) {
	// console.log('Congratulations, your extension "anno-modding-translator" is now active!');
	/* context.subscriptions.push(
		vscode.commands.registerCommand('anno-modding-translator.helloWorld', async () => {
			const test = readJson(vscode.window.activeTextEditor.document.fileName);
			helloWorld()
		})
	); */
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
