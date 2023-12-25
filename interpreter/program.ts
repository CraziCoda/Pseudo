import { a } from "@tauri-apps/api/app-5190a154";
import store from "../redux/store/app";
import {
	jmp_for,
	jmp_to_do_start,
	jmp_to_for_start,
	jmp_to_loop_start,
	jmp_while,
	jmpif,
	move_to_next_instruction,
} from "./control_scope_function";
import {
	declare_variable,
	print_to_screen,
	take_input,
	variable_assignment,
} from "./functions";
import {
	IInterpreterSlice,
	exit_debug_mode,
	move_program_counter,
	run_executables,
	uninterrupt_program,
} from "@/redux/reducers/interpreter";

interface token_info {
	type: "keyword" | "identifier" | "operation";
	name: string;
}

export type pseudo_actions =
	| "output"
	| "input"
	| "variable"
	| "assignment"
	| "jmpif"
	| "jmpelif"
	| "jmpend"
	| "exit_scope"
	| "startwhile"
	| "endwhile"
	| "whileend"
	| "startfor"
	| "endfor"
	| "startdo"
	| "enddo"
	| "until"
	| "startrepeat"
	| "";

export interface CommandI {
	operation: pseudo_actions;
	args: string;
	line: number;
	scope: string;
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
export const number_regex = /^[+-]?\d+[.]?(\d)*$/;
export const integer_regex = /^[-+]?\d+$/;
export const float_regex = /^[+-]?\d+\.\d+$/;
// export const string_regex = /(['"])(.*?)\1$/;
export const string_regex = /^["][^"]*"$|^['][^']*'$/;
export const comma_regex =
	/,\s*(?=(?:(?:[^"]*"){2})*[^"]*$)(?=(?:(?:[^']*'){2})*[^']*$)/;
export const fn_identifier_regex = /^[a-zA-Z_][\w ]*[(].*\)$/;

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

export function execute_instructions() {
	// let program_counter = store.getState().interpreter.program_counter;
	const executables = store.getState().interpreter.executable;

	function call_select() {
		if (store.getState().interpreter.interrupted) {
			clearInterval(id);
			return;
		}
		const program_counter = store.getState().interpreter.program_counter;
		const command = executables[program_counter];

		if (program_counter >= executables.length) {
			clearInterval(id);
			return;
		}

		select_function(command.operation, command.args);
	}

	const id = setInterval(call_select, 0);
}

export function execute_instructions_timed(time: number) {
	store.dispatch(run_executables());
	store.dispatch(uninterrupt_program());
	const executables = store.getState().interpreter.executable;

	function call_select() {
		if (store.getState().interpreter.interrupted) {
			clearInterval(id);
			return;
		}
		const program_counter = store.getState().interpreter.program_counter;

		if (program_counter >= executables.length) {
			clearInterval(id);
			return;
		}
		const command = executables[program_counter];

		select_function(command.operation, command.args);
	}

	const id = setInterval(call_select, time * 1000);
}
export function execute_instructions_step() {
	const executables = store.getState().interpreter.executable;
	const program_counter = store.getState().interpreter.program_counter;
	if (store.getState().interpreter.interrupted) {
		return;
	}
	if (program_counter >= executables.length) {
		store.dispatch(exit_debug_mode());
		return;
	}

	const command = executables[program_counter];

	select_function(command.operation, command.args);
}

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

export function select_function(action: pseudo_actions, args: string) {
	let skip = false;
	switch (action) {
		case "output":
			print_to_screen(args);
			break;
		case "input":
			take_input(args);
			break;
		case "variable":
			declare_variable(args);
			break;
		case "assignment":
			variable_assignment(args);
			break;
		case "jmpif":
			skip = jmpif(args);
			break;
		case "jmpelif":
			skip = jmpif(args);
			break;
		case "startwhile":
			skip = jmp_while(args);
			break;
		case "endwhile":
			jmp_to_loop_start(args);
			skip = true;
			break;
		case "exit_scope":
			break;
		case "startfor":
			jmp_for(args);
			break;
		case "endfor":
			jmp_to_for_start(args);
			break;
		case "startdo":
			break;
		case "enddo":
			jmp_to_do_start(args);
			break;
		case "startrepeat":
			break;
		case "until":
			jmp_to_do_start(args);
			// console.log(args);
			break;
		default:
			console.log("Nothing changed");
			break;
	}

	if (!skip) move_to_next_instruction();
}
