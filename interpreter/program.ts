import { BsReplyAll } from "react-icons/bs";
import {
	declare_variable,
	print_to_screen,
	variable_assignment,
} from "./functions";
import { IInterpreterSlice } from "@/redux/reducers/interpreter";

interface token_info {
	type: "keyword" | "identifier" | "operation";
	name: string;
}

type pseudo_actions = "output" | "input" | "variable" | "assignment" | "";

export interface CommandI {
	operation: pseudo_actions;
	args: string;
	line: number;
}

export type data_type_t =
	| "integer"
	| "string"
	| "double"
	| "float"
	| "bool"
	| "boolean"
	| "char";

export const pseudo_data_type: data_type_t[] = [
	"integer",
	"string",
	"double",
	"float",
	"bool",
	"boolean",
	"char",
];

export const identifier_regex = /^[a-zA-Z_]\w*$/;
export const number_regex = /[+-]?\d+(\.\d+)?/g;
export const integer_regex = /^-?\d+$/;
export const float_regex = /-?\d+\.\d+$/;
export const string_regex = /(['"])(.*?)\1$/g;

export interface VariableI {
	readonly name: string;
	value: any;
	type: data_type_t;
	scope?: string;
}

export const pseudo_keywords = [
	"input",
	"read",
	"get",
	"accept",
	"write",
	"print",
	"show",
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
	"do",
	"repeat",
	"until",
	...pseudo_data_type,
];

export const pseudo_keyword_type = {
	output: ["write", "output", "display", "show", "print"],
	input: ["input", "read", "accept", "get"],
	variable: ["declare"],
};

export function idenitfy_token(token: string): token_info | null {
	//check if token is a keyword
	if (pseudo_keywords.includes(token.toLowerCase())) {
		return { name: token, type: "keyword" };
	} else if (identifier_regex.test(token)) {
		return { name: token, type: "identifier" };
	}

	return null;
}

export function get_keyword_type(token: string): pseudo_actions {
	if (pseudo_keyword_type.output.includes(token.toLowerCase())) return "output";
	else if (pseudo_keyword_type.input.includes(token.toLowerCase()))
		return "input";
	else if (pseudo_keyword_type.variable.includes(token.toLowerCase()))
		return "variable";

	return "";
}

export function select_function(
	action: pseudo_actions,
	args: string,
	variables: VariableI[] = [],
	current_scope: string = "global"
) {
	switch (action) {
		case "output":
			print_to_screen(args);
			break;
		case "input":
			break;
		case "variable":
			declare_variable(args, variables, current_scope);
			break;
		case "assignment":
			variable_assignment(args, variables, current_scope);
			break;
		case "":
			break;
		default:
			console.log("Nothing changed");
			break;
	}
}
