import * as vscode from "vscode";
import { writeFile, readFile, writeFileSync, readFileSync } from "node:fs";
import * as path from "path";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

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
export async function writeJSON(filePath: string, pJson: any): Promise<void> {
	const data = new Uint8Array(Buffer.from(JSON.stringify(pJson, null, "\t")));
	writeFile(filePath, data, err => {
		if (err) throw err;
		vscode.window.showInformationMessage("File has been saved!");
	});
}

export async function writeXML(filePath: string, pXML: any): Promise<boolean> {
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