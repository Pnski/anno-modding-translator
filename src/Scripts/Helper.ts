import { readDir } from "./Files";

export function getCLanguages(aLn: { [key: string]: string }): string[] {
    var aLn_List = [];
	for (const [key, value] of Object.entries(aLn)) {
		aLn_List.push(key);
	}
	return aLn_List;
}

export function getMLanguages(lang: any[], aLn: string[]): string[] {
	let _miss = aLn.filter(item => lang.indexOf(item) < 0);
	return _miss;
}

export function getALanguages(filePath: string, aLn: { [key: string]: string }): string[][] {
    let _cLang : string[] = [];
    for (const i of readDir(filePath)) {
        _cLang.push(i.match("texts_(.*).xml")[1]);
    }
	let _mLang = getMLanguages(_cLang, getCLanguages(aLn));
	return [_cLang, _mLang];
}
