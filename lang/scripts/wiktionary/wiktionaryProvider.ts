const get = require("got");
const URL = require("url");
/* const flat = require("flat");
const { get: getProp } = require("lodash");
const cheerio = require("cheerio"); */

console.log("importing wiktionary");

import WMirrors from "./wiktionaryConfig";

export async function wiktionaryLookup(Word: string, Language: string): Promise<any> {
	var url = "https://" + Language + ".wikipedia.org/w/api.php";

	var params: { [key: string]: string } = {
		action: "query",
		format: "json",
		titles: Word,
		prop: "extracts",
		formatversion: "2",
		redirects: "1"
	};

	url = url + "?origin=*";
	Object.keys(params).forEach(function (key) {
		url += "&" + key + "=" + params[key];
	});

	var res: any = await (await fetch(url + "&exintro&explaintext")).json();
	console.log("await", res.query.pages[0].extract);
	return await res.query.pages[0].extract;
}
