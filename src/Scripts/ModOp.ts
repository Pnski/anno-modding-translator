import { MET } from "bing-translate-api";

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
