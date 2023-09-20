import type {
	languages,
	editor,
} from "/home/killcode/Documents/projects/pseudo/node_modules/monaco-editor/esm/vs/editor/editor.api.d.ts";

export const keywords = [
	"input",
	"read",
	"get",
	"accept",
	"write",
	"print",
	"output",
	"display",
	"if",
	"endif",
	"then",
	"else",
	"is",
	"true",
	"false",
	"for",
	"to",
	"step",
	"endfor",
	"while",
	"endwhile",
	"declare",
	"as",
	"integer",
	"do",
	"repeat",
	"until",
];
export const lang_tokens: languages.IMonarchLanguage = {
	keywords,
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
			[/".*?"/, "string"],
			[/\/\/(.+)/, "comment"],
		],
	},
	ignoreCase: true,
};

export const editor_theme: editor.IStandaloneThemeData = {
	base: "vs-dark",
	rules: [
		{ token: "keyword", fontStyle: "bold", foreground: "#dd0000" },
		{ token: "comment", foreground: "#888888" },
	],
	inherit: true,
	colors: {},
};
