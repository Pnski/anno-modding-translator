import LTSMirrors from "./libreConfig";

export default async function singleTranslate(TranslateText: string, TranslateTo: string,TranslateFrom: string='auto'): Promise<any> {
    for await (let _URL of LTSMirrors) {
        try {
            const res = await fetch(_URL, {
                method: "POST",
                body: JSON.stringify({
                    q: TranslateText,
                    source: TranslateFrom,
                    target: TranslateTo,
                    format: "text",
                }),
                headers: { "Content-Type": "application/json" }
            }).then((res) => res.json());
            console.log(res)
            //return { text: res?.translatedText }
        } catch (err) {
            //console.log(`Mirror failed: ${_URL} with the next error:\n\n> ${err.message}\n\nTrying with the next one...\n`);
        }
    }

    throw new Error("All libreTranslate mirrors failed. Please try again later.")
}
/* 
const libreTranslate = async (text, { from, to }) => {
	for await (url of mirrors) {
		try {
			const res = await fetch(url, {
				method: "POST",
				body: JSON.stringify({
					q: text,
					source: from,
					target: to,
					format: "text"
				}),
				headers: { "Content-Type": "application/json" }
			}).then(res => res.json());

			return { text: res.translatedText };
		} catch (err) {
			console.log(`Mirror failed: ${url} with the next error:\n\n> ${err.message}\n\nTrying with the next one...\n`);
		}
	}

	throw new Error("All libreTranslate mirrors failed. Please try again later.");
};
 */