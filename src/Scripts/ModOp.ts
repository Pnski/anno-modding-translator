import * as vscode from "vscode";
import * as hTrans from "./Translation";
import { MET } from "bing-translate-api";

/* import fs from 'fs';
import { XMLParser as parser, XMLBuilder } from 'fast-xml-parser';

const parserOptions = {
  attributeNamePrefix: "@@",
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  parseTrueNumberOnly: false,
  arrayMode: false
};

const builderOptions = {
  attributeNamePrefix: "@@",
  ignoreAttributes: false,
  format: true,
  commentPropName: "#comment"
}; */

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

export async function getMultipleResults(XML: any, loca: string[]): Promise<any> {
	// Array to hold translation results
	const translatedTexts = [];
	// Extract ModOps from parsed XML
	var _modOps = Array.isArray(XML.ModOp) ? XML.ModOp : [XML.ModOp];
	console.log("XML", XML);
	//const translations = await MET.translate(parsedXML, null, languageCode);
	// Translate texts
	/* const translatedTexts = await MET.translate(
		textsToTranslate.map((item) => item.Text),
		null,
		[languageCode]
	  );
  
	  // Map translations back to ModOps
	  textsToTranslate.forEach((item, index) => {
		item.Text = translatedTexts[index].translatedText;
	  }); */
}

/* const totalValues = (nestedObjects: NestedObject[]) => {
  return nestedObjects.reduce(
    (totalValue, nestedObject: NestedObject): number => {
      // Add the current object's value
      totalValue += nestedObject.value;

      // If we have children, let's add their values too
      if (nestedObject.children) {
        totalValue += totalValues(nestedObject.children);
      }

      // Return the new total
      return totalValue;
    },
    0,
  );
};
 */

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

export async function _gModOps(pXML: ModOpsContainer, loca: string[], optComm?: string): Promise<any> {
	let _pXML: { [key: string]: ModOpsContainer } = {};
	loca.forEach(el => (_pXML[el] = structuredClone(pXML)));
	if (Array.isArray(pXML.ModOps)) {
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
							let _get = await MET.translate(value.Text, null, loca, {
								translateOptions: {
									textType: "html" as unknown as object
								}
							});
							for (var i = 0; i < _get[0].translations.length; i++) {
								if (typeof _pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].comment == 'undefined') {
									_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].comment = [];
								}
								if (_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text != _get[0].translations[i].text) {
									_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text = _get[0].translations[i].text;
									_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].comment.push(optComm);
								}
							}
						}
						break;
					}
					case "object": {
						for (let _TextIndex in value.Text) {
							console.log("Translating: " + value.Text[_TextIndex].Text.substring(0, 20));
							if (value.Text[_TextIndex].Text.length == 0) {
								console.error("Empty Text detected skipping!");
							} else {
								let _get = await MET.translate(value.Text[_TextIndex].Text, null, loca, {
									translateOptions: {
										// Explicitly set textType as `html`. Defaults to `plain`.
										textType: "html" as unknown as object
									}
								});
								for (var i = 0; i < _get[0].translations.length; i++) {
									if (typeof _pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].comment == 'undefined') {
										_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].comment = [];
									}
									console.log("testing no comment",_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].comment);
									if (_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].Text != _get[0].translations[i].text) {
										_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].Text = _get[0].translations[i].text;
										_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].comment.push(optComm);
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
