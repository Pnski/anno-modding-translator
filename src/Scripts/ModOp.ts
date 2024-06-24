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
    [key: string]: any; // Allow for other properties
}

interface ModOpsContainer {
    ModOps: {
        ModOp: ModOp[];
    };
    [key: string]: any; // Allow for other properties
}

export async function _gModOps(pXML: ModOpsContainer, loca: string[]): Promise<any> {
	console.log("starting");
	//let _pXML = new WeakMap()
	let _pXML: { [key: string]: ModOpsContainer } = {};
	loca.forEach(el => (_pXML[el] = structuredClone(pXML)));
	if (Array.isArray(pXML.ModOps)) {
		return "";
	} else {
		console.log("pXML", pXML.ModOps);
		if (Array.isArray(pXML.ModOps.ModOp)) {
			for (let [key, value] of Object.entries(pXML.ModOps.ModOp)) {
				switch (typeof value.Text) {
					case "string": {
						console.log("Translating: "+value.Text)
						let _get = await MET.translate(value.Text, null, loca);
						// only one string translated alway [0]
						for (var i = 0; i < _get[0].translations.length; i++) {
							_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text = _get[0].translations[i].text;
						}
						break;
					}
					case "object": {
						for (let _TextIndex in value.Text) {
							console.log("Translating: "+value.Text[_TextIndex].Text)
							let _get = await MET.translate(value.Text[_TextIndex].Text, null, loca);
							for (var i = 0; i < _get[0].translations.length; i++) {
								_pXML[_get[0].translations[i].to].ModOps.ModOp[parseInt(key)].Text[parseInt(_TextIndex)].Text = _get[0].translations[i].text;
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
		}
	}
	console.warn("new pxml last line",_pXML)
	return _pXML;
}
