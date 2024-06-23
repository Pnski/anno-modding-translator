import * as vscode from "vscode";
import { writeFile, readFile, writeFileSync, readFileSync, readdirSync } from "node:fs";
import * as path from "path";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

// Define XML parser options for fast-xml-parser
const parserOptions = {
	attributeNamePrefix: "@@",
	ignoreAttributes: false,
	allowBooleanAttributes: true,
	parseNodeValue: true,
	parseAttributeValue: false,
	trimValues: true,
	parseTrueNumberOnly: false,
	arrayMode: false,
	commentPropName: "#comment",
	format:true
  };

  /* ignoreAttributes: false,
		attributeNamePrefix: "@@",
		format: true,
		commentPropName: "#comment" */

/* read files */
export async function readJson(filePath: string): Promise<any> {
	if (filePath.endsWith(".json")) {
		const loadedJSON = await readFileSync(filePath, "utf-8");
		return JSON.parse(loadedJSON);
	} else {
		console.error("Not a JSON you donkey!");
		return false;
	}
}

export async function readXML(filePath: string): Promise<any> {
	const parser = new XMLParser(parserOptions);
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
export async function writeJSON(filePath: string, pJson: any): Promise<void> {
	const data = new Uint8Array(Buffer.from(JSON.stringify(pJson, null, "\t")));
	writeFile(filePath, data, err => {
		if (err) throw err;
		vscode.window.showInformationMessage("File has been saved!");
	});
}

export async function writeXML(filePath: string, pXML: any): Promise<boolean> {
	const builder = new XMLBuilder(parserOptions);
	const xmlOutput = builder.build(pXML).replaceAll("&apos;", "'").replaceAll("&quot;", '"');
	writeFileSync(filePath, xmlOutput);
	return true;
}

export function readDir(filePath: string): string[] {
	return readdirSync(filePath.substring(0, filePath.lastIndexOf("\\") + 1));
}
