import * as vscode from "vscode";
import { writeFile, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { translate } from "bing-translate-api";

export async function readJson(filePath: string): Promise<any> {
	if (filePath.endsWith(".json")) {
		const loadedJSON = await readFileSync(filePath, "utf-8");
		return JSON.parse(loadedJSON);
	} else {
		console.error("Not a JSON you donkey!");
		return false;
	}
}

async function myTagFunction(key: string, val: string, jpath: string): Promise<string> {
	console.log("mytag", key, val, jpath);
	let _get = await translate(val, null, "ja");
	console.log(_get.translation);
	return _get.translation;
}

export async function readXML(filePath: string): Promise<any> {
	const parserOptions = {
		attributeNamePrefix: "@@",
		ignoreAttributes: false,
		commentPropName: "comment",
		format: true,
		isArray: (tagName: string) => {
			if (tagName == "ModOp") return true;
			if (tagName == "comment") return true;
		},
		tagValueProcessor: (tagName: string, tagValue: string) => {
			if (tagName == "Text") {
				var str = tagValue.replaceAll(/\[(.*?)\](?!\))/gi, "<div class='notranslate'>$1</div>");
				return str;
			}
			return tagValue;
		}
	};
	const parser = new XMLParser(parserOptions);
	if (filePath.endsWith(".xml")) {
		const loadedXML = readFileSync(filePath, "utf-8");
		let parsedXML = await parser.parse(loadedXML);
		return await parsedXML;
	} else {
		console.error("Not a XML you donkey!");
		return false;
	}
}

/* write files */
export async function writeJSON(filePath: string, pJson: any): Promise<void> {
	const data = new Uint8Array(Buffer.from(JSON.stringify(pJson, null, "\t")));
	writeFile(filePath, data, err => {
		if (err) throw err;
		vscode.window.showInformationMessage("File has been saved!");
	});
}

export async function writeXML(filePath: string, pXML: any): Promise<boolean> {
	const parserOptions = {
		attributeNamePrefix: "@@",
		ignoreAttributes: false,
		commentPropName: "comment",
		format: true
	};
	const builder = new XMLBuilder(parserOptions);
	const xmlOutput = builder
		.build(pXML)
		.replaceAll("&apos;", "'")
		.replaceAll("&quot;", '"')
		.replaceAll("&lt;div class='notranslate'&gt;", "[")
		.replaceAll("&lt;/div&gt;", "]");
	writeFileSync(filePath, xmlOutput);
	return true;
}

export function readDir(filePath: string): string[] {
	return readdirSync(filePath.substring(0, filePath.lastIndexOf("\\") + 1));
}
