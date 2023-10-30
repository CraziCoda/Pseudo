import { pseudo_keywords } from "@/interpreter/program";

import type {
	languages,
	editor,
} from "/home/killcode/Documents/projects/pseudo/node_modules/monaco-editor/esm/vs/editor/editor.api.d.ts";

export const lang_tokens: languages.IMonarchLanguage = {
	keywords: pseudo_keywords,
	tokenizer: {
		root: [
			[
				/@?[a-zA-Z][\w$]*/,
				{
					cases: {
						"@keywords": "keyword",
						"@default": "variable",
					},
				},
			],
			[/(['"])(.*?)\1/, "string"],
			[/\/\/(.+)/, "comment"],
			[/[+-]?\d+(\.\d+)?/g, "number"],
			[/[a-zA-Z_]\w+/, "variable"],
		],
	},
	ignoreCase: true,
};

export const editor_theme: editor.IStandaloneThemeData = {
	base: "vs-dark",
	rules: [
		{ token: "keyword", fontStyle: "bold", foreground: "#ff7777" },
		{ token: "comment", foreground: "#888888" },
		{ token: "number", foreground: "#33ff33" },
		{ token: "variable", foreground: "#ffff00" },
	],
	inherit: true,
	colors: {},
};

type monaco =
	typeof import("/home/killcode/Documents/projects/pseudo/node_modules/monaco-editor/esm/vs/editor/editor.api");

export function add_editor_commands(monaco: monaco) {}
