import * as vscode from "vscode";
const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");

const MODEL_NAME = "models/text-bison-001"; // english only, but doesn't require creditcard

var config: any = vscode.workspace.getConfiguration("amt.Google");

vscode.workspace.onDidChangeConfiguration(e => {
	if (e.affectsConfiguration("amt.Translation")) {
		config = vscode.workspace.getConfiguration("amt.Google");
	}
});

//https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text

const promptString = "Storing teffs as feed for farm animals increases farm productivity.1 additional product is produced every second cycle";

export async function paraphrase() {
	const client = await new TextServiceClient({
		authClient: new GoogleAuth().fromAPIKey(config.Key)
	});
	await client
		.generateText({
			// required, which model to use to generate the result
			model: MODEL_NAME,
			// optional, 0.0 always uses the highest-probability result
			temperature: 0.4,
			// optional, how many candidate results to generate
			candidateCount: 4,
			// optional, number of most probable tokens to consider for generation
			top_k: 40,
			// optional, for nucleus sampling decoding strategy
			top_p: 0.95,
			// optional, maximum number of output tokens to generate
			max_output_tokens: 1024,
			prompt: {
				text: "Rewrite the following sentence and fix any grammar issues.\n\n" + promptString
			}
		})
		.then((result: any) => {
			result[0].candidates.forEach((e: any) => console.log("e", e.output));
			console.log(result);
			//console.log(JSON.stringify(result, null, 2));
			return result;
		});
}

export async function paraphrase2() {
	const client = await new TextServiceClient({
		authClient: new GoogleAuth().fromAPIKey(config.Key)
	});
	await client
		.generateText({
			// required, which model to use to generate the result
			model: MODEL_NAME,
			// optional, 0.0 always uses the highest-probability result
			temperature: 0.4,
			// optional, how many candidate results to generate
			candidateCount: 4,
			// optional, number of most probable tokens to consider for generation
			top_k: 40,
			// optional, for nucleus sampling decoding strategy
			top_p: 0.95,
			// optional, maximum number of output tokens to generate
			max_output_tokens: 1024,
			prompt: {
				text: "Give me alternative words and thesaurus for the fellowing string.\n\n" + promptString
			}
		})
		.then((result: any) => {
			//console.log(JSON.stringify(result, null, 2));
			result[0].candidates.forEach((e: any) => console.log("e", e.output));
			console.log(result);
			return result;
		});
}

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(config.Key);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 2,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
    ],
  });

  const result = await chatSession.sendMessage("Here's a blurb for an upcoming startup event. Rewrite this in a more professional tone intended for a corporate email. \n\n\"Calling all tech junkies, investors, and curious minds! 🤖🧠🎉\n\nReady to witness the future? We're throwing a pitch party where brilliant startups will showcase their mind-blowing AI creations. Think healthcare that reads your mind (almost!), businesses that run themselves (we wish!), and robots that make you coffee (we definitely need!).Whether you're an investor, a budding entrepreneur, or just someone who wants to geek out over AI, this event is your jam! Come watch the pitches, mingle with industry experts, and get inspired by these rockstar companies. Oh, and did we mention free food and drinks? Register now before the robots take all the spots! 😉\"");
  console.log("gemini result",result.response.text());
}

run();

import { RawResponse, Sentence, TranslateOptions } from "./googleConfig";

function extractTooManyRequestsInfo(html: string) {
	const ip = html.match(/IP address: (.+?)<br>/)?.[1] || "";
	const time = html.match(/Time: (.+?)<br>/)?.[1] || "";
	const url = (html.match(/URL: (.+?)<br>/)?.[1] || "").replace(/&amp;/g, "&");
	return { ip, time, url };
}

const defaults: Required<Pick<TranslateOptions, "from" | "to" | "host">> = {
	from: "auto",
	to: "en",
	host: "translate.google.com"
};

export async function translate(inputText: string, options?: TranslateOptions) {
	return new Translator(inputText, options).translate();
}

export class Translator {
	protected options: typeof defaults & TranslateOptions;

	constructor(protected inputText: string, options?: TranslateOptions) {
		this.options = Object.assign({}, defaults, options);
	}

	async translate() {
		const url = this.buildUrl();
		const fetchOptions = this.buildFetchOptions();
		const res = await fetch(url, fetchOptions);
		if (!res.ok) throw await this.buildError(res);
		const raw = (await res.json()) as RawResponse;
		const text = this.buildResText(raw);
		return { text, raw };
	}

	protected buildUrl() {
		const { host } = this.options;
		return [
			`https://${host}/translate_a/single`,
			"?client=at",
			"&dt=t", // return sentences
			"&dt=rm", // add translit to sentences
			"&dj=1" // result as pretty json instead of deep nested arrays
		].join("");
	}

	protected buildBody() {
		const { from, to } = this.options;
		const params = {
			sl: from,
			tl: to,
			q: this.inputText
		};
		return new URLSearchParams(params).toString();
	}

	protected buildFetchOptions() {
		const { fetchOptions } = this.options;
		const res = Object.assign({}, fetchOptions);
		res.method = "POST";
		res.headers = Object.assign({}, res.headers, {
			"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
		});
		res.body = this.buildBody();
		return res;
	}

	protected buildResText({ sentences }: RawResponse) {
		return sentences
			.filter((s): s is Sentence => "trans" in s)
			.map(s => s.trans)
			.join("");
	}

	protected async buildError(res: Response) {
		if (res.status === 429) {
			const text = await res.text();
			const { ip, time, url } = extractTooManyRequestsInfo(text);
			const message = `${res.statusText} IP: ${ip}, Time: ${time}, Url: ${url}`;
			return (res.status, message);
		} else {
			return (res.status, res.statusText);
		}
	}
}
