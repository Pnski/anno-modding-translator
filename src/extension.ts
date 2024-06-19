import * as vscode from 'vscode';
import * as bt from 'bing-translate-api';
import {writeFile} from 'node:fs';
import * as path from 'path';

const aLn = [
	{name : "chinese", file : "texts_chinese.xml", short : "zh-Hans"},
	{name : "Taiwanese", file : "texts_taiwanese.xml", short : "zh-Hant"},
	{name : "english", file : "texts_english.xml", short : "en"},
   	{name : "french", file : "texts_french.xml", short : "fr"},
    {name : "german", file : "texts_german.xml", short : "de"},
    {name : "italian", file : "texts_italian.xml", short : "it"},
    {name : "japanese", file : "texts_japanese.xml", short : "ja"},
    {name : "korean", file : "texts_korean.xml", short : "ko"},
    {name : "polish", file : "texts_polish.xml", short : "pl"},
    {name : "russian", file : "texts_russian.xml", short : "ru"},
    {name : "spanish", file : "texts_spanish.xml", short : "es"}
];

async function ModInfo() {
    const editor = vscode.window.activeTextEditor;
	console.log("startet modinfo");
	if (editor!.document.fileName.search('modinfo.json') > 0) {
		for (var k = 0; k < aLn.length; k++) {
			const regex = new RegExp(aLn[k].name, 'i');
			// get all lines with translationtext
			for (var i = 0; i < editor!.document.lineCount; i++) {
				if (regex.test(editor!.document.lineAt(i).text) && editor!.document.lineAt(i).text.search('null') == -1) {
					var tSplit = editor!.document.lineAt(i).text.split(":")[1].split("\"")[1];
					await bt.translate(tSplit, null, aLn[k].short).then(res => {
						editor!.edit(eBuilder => {
							var rRange = new vscode.Range(new vscode.Position(i,0),new vscode.Position(i,editor!.document.lineAt(i).text.length))
							eBuilder.replace(rRange,editor!.document.lineAt(i).text.replaceAll(tSplit,res?.translation as string));
						})
					}).catch(err => {
						console.error(err);
					});
				}
			}
		}
	} else {
		vscode.window.showInformationMessage('This is not a modinfo.json file!');
	};
}

async function Texts() {
    const editor = vscode.window.activeTextEditor;
	console.log("startet texts");
	if (editor!.document.fileName.search('texts.*.xml') > 0) {
		for (var i = 0; i < aLn.length; i++) {
			if (editor!.document.fileName.search(aLn[i].file) > 0) {
				const regex = new RegExp('<Text>(.*)</Text>', 'i');
				// get all lines with translationtext
				for (var k = 0; k < editor!.document.lineCount; k++) { // 5
					const vLine = editor!.document.lineAt(k).text;
					if (regex.test(vLine)) {
						var tSplit = vLine.match('<Text>(.*)</Text>')![1];
						await bt.translate(tSplit, null, aLn[i].short).then(res => {
						editor!.edit(eBuilder => {
							var match = regex.exec(vLine);
							var vRange1 = new vscode.Position(k,match!.index+'<Text>'.length);
							var vRange2 = new vscode.Position(k,match!.index+tSplit.length+'<Text>'.length);
							var rRange = new vscode.Range(vRange1, vRange2);
							//console.log("line",k,"text",tSplit,"length",tSplit.length,match!.index);
							//var rRange = new vscode.Range(new vscode.Position(k,0),new vscode.Position(k,editor!.document.lineAt(k).text.length))
							eBuilder.delete(rRange);
							eBuilder.insert(vRange1,res?.translation as string);
							})
						}).catch(err => {
							console.log("line:",k);
							console.error(err);
						});
					} else {
						console.log("line:",k, editor!.document.lineAt(k).text);
					} 
				}
			}
		}
	} else {
		vscode.window.showInformationMessage('This is not a texts_ file!');
	};
}

async function createMissingLocaFiles(uri:vscode.Uri, ind:number) {
	const Path = path.dirname(uri.fsPath);
	for (var i = 0; i < aLn.length; i++) {
		if (!(i == ind)) {
			var languageFilePath = path.join(Path, aLn[i].file)
			const data = new Uint8Array(Buffer.from(''));
			writeFile(languageFilePath, data, (err) => {
				if (err) throw err;
				console.log('The file has been saved!');
			});
		}
	}
}

async function copyMissingLocaFiles(uri:vscode.Uri, ind:number):Promise<void> {
	const path = uri.fsPath;
	return;
}

async function getOtherLanguages(uri:vscode.Uri) {
	var loca : number;
	for (var i = 0; i < aLn.length; i++) {
		if (uri.fsPath.match(aLn[i].file)) {
			loca = i;
			break;
		}
	}
	if (loca! === undefined) { //Failsafe
		vscode.window.showErrorMessage('Thats not a valid texts_*.xml you donkey!');
		return;
	} else { 
		vscode.window.showInformationMessage('Your selected file is in: "'+aLn[loca].name.toUpperCase()+'" the fellowing procedure will OVERWRITE all other localization files. Do you wish to continue?', 'Yes', 'No').then((item)=>{
			if (item == 'Yes') {
				vscode.window.showInformationMessage('starting');
				createMissingLocaFiles(uri, loca);
				copyMissingLocaFiles(uri,loca);
			} else {
				vscode.window.showErrorMessage('ABORTED!');
			}
		});
	}
}

async function helloWorld() {
	const patt = new RegExp('<Text>(.*)</Text>','gi');
	const str = vscode!.window!.activeTextEditor!.document.lineAt(2).text;
	//console.log(Array.from(str.matchAll(regex)).map(match => match.index),regex.lastIndex);
	//Array.from(str.match(regex)).map(match => match.index)
	
	
	//vscode!.window!.activeTextEditor!.edit(eBuilder => {
	//	eBuilder.insert(vRange1,'+');
	//	eBuilder.insert(vRange2,'+');
	//})
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "anno-modding-translator" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand('anno-modding-translator.helloWorld', async () => {
			helloWorld();
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('anno-modding-translator.Modinfo', async () => {
			// ModName
			// Description
			// activeTextEditor.document.fileName end with modinfo.json
			ModInfo();
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('anno-modding-translator.Texts', async () => {
			// ModName
			// Description
			// activeTextEditor.document.fileName end with modinfo.json
			Texts();
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('anno-modding-translator.getOtherLanguages', async (uri:vscode.Uri) => {
			// ModName
			// Description
			// activeTextEditor.document.fileName end with modinfo.json
			getOtherLanguages(uri);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('anno-modding-translator.Inplace', async () => {
			
			const editor = vscode.window.activeTextEditor;
			for (var i = 0; i < aLn.length; i++) {
				bt.translate('Anno Mods are cool', null, aLn[i].short).then(res => {
					console.log(res?.translation);
				  }).catch(err => {
					console.error(err);
				  });
			  }
			if (editor) {
				let document = editor.document;
	
				// Get the document text
				const documentText = document.getText();
	
				// DO SOMETHING WITH `documentText`
				//console.log(documentText);
				const regex = new RegExp('test', 'g');
				documentText.trim()
				const target = documentText.replace(regex, 'mudda');
				console.log(target)
			};
		})
	);
};

// This method is called when your extension is deactivated
export function deactivate() {}