import {
	float_regex,
	integer_regex,
	number_regex,
	string_regex,
} from "./program";
import generic_error from "./error_functions";
import store from "../redux/store/app";
import { interrupt_program, move_program_counter } from "@/redux/reducers/interpreter";
import { pause_terminal } from "@/redux/reducers/terminal";

export function match_string_between_two_characters(
	text: string,
	start: string,
	end: string,
	level: number
): string[] | null {
	let current_level = 0;
	let matched_string = "";
	let matches: string[] = [];

	for (let i = 0; i < text.length; i++) {
		const character = text[i];
		if (character == start) current_level++;

		if (current_level >= level) matched_string += character;

		if (character == end) {
			current_level--;
			if (current_level < level) {
				if (matched_string != "") matches.push(matched_string);
				matched_string = "";
			}
		}
	}

	if (current_level != 0) return null;
	return matches;
}
export function work_on_operations(operation: string) {
	if (/([\d]+[.]?[\d]*|true|false)[(]/.test(operation)) {
		//@ts-expect-error
		const err_op = operation.match(/([\d]+[.]?[\d]*|true|false)[(].*/)[0];

		// Add a did you mean section to thismatch_string_between_two_characters
		generic_error(`Unexpected operation: ${err_op}`);
		return "";
	}

	if (get_all_special_characters(operation)) return "";

	if (!validate_operations(operation)) return "";

	const final_op = get_brackets_values(operation);
	// console.log("Final:", final_op);

	return final_op;
}

function get_brackets_values(op: string) {
	const bracket_operations = match_string_between_two_characters(
		op,
		"(",
		")",
		1
	);

	// Check if string operation is invalid
	if (/(["][^"]*"|['][^']*')[^+=!\s]$/.test(op + " ")) {
		//@ts-expect-error
		const err_op = op.match(/(["][^"]*"|['][^']*')[^+=!]?.*/)[0];

		// Add a did you mean section to this
		generic_error(`Unexpected operation: ${err_op}`);
		return "";
	}

	if (bracket_operations == null) {
		generic_error(`Unmatched brackets in '${op}'`);
		return op;
	}

	for (let i = 0; i < bracket_operations.length; i++) {
		const _op = bracket_operations[i];
		let op_ans = get_brackets_values(_op.substring(1, _op.length - 1));

		op_ans = first_precendence(op_ans);

		op = op.replace(_op, op_ans);
	}

	op = first_precendence(op);

	return op;
}

function first_precendence(op: string) {
	if (/!/.test(op)) {
		if (/!true|!false/.test(op)) {
			op = op.replace(/!true/i, "false");
			op = op.replace(/!false/i, "true");
		}
		// } else {
		// 	// raise error
		// 	generic_error(`Expected a true or false after !: ${op}`);
		// 	return "";
		// }
	}
	op = second_precedence(op);
	return op;
}

function second_precedence(op: string): string {
	let op_copy = op;

	const second_precedence_regex =
		/([-]?[\d]+[.]?([\d])*|(true|false))[\/*%]([-]?[\d]+[.]?([\d])*|(true|false))/;

	while (second_precedence_regex.test(op_copy)) {
		// op_copy = op_copy.replaceAll("true", "1");
		// op_copy = op_copy.replaceAll("false", "0");

		//@ts-ignore
		const eq = op_copy.match(second_precedence_regex)[0];

		const args = eq.split(/[/*%]/);

		//@ts-ignore
		const operator = op_copy.match(/[/*%]/)[0];
		let operand1: number, operand2: number;

		args[0] = args[0].replaceAll(/true/g, "1");
		args[0] = args[0].replaceAll(/false/g, "0");

		args[1] = args[1].replaceAll(/true/g, "1");
		args[1] = args[1].replaceAll(/false/g, "0");

		switch (operator) {
			case "*":
				operand1 = float_regex.test(args[0])
					? parseFloat(args[0])
					: parseInt(args[0]);
				operand2 = float_regex.test(args[1])
					? parseFloat(args[1])
					: parseInt(args[1]);

				op_copy = op_copy.replace(eq, (operand1 * operand2).toString());
				break;
			case "%":
				// op = (operand1 % operand2).toString();
				operand1 = Math.abs(parseInt(args[0]));
				operand2 = Math.abs(parseInt(args[1]));

				if (operand2 == 0) {
					// error
					generic_error("Division by 0");
					return "";
				}

				op_copy = op_copy.replace(eq, (operand1 % operand2).toString());

				break;
			case "/":
				operand1 = float_regex.test(args[0])
					? parseFloat(args[0])
					: parseInt(args[0]);
				operand2 = float_regex.test(args[1])
					? parseFloat(args[1])
					: parseInt(args[1]);

				if (operand2 == 0) {
					// error
					generic_error("Division by 0");
					return "";
				}

				op_copy = op_copy.replace(eq, (operand1 / operand2).toString());
				break;
			default:
				break;
		}
	}

	if (/[\/*%]/.test(op_copy)) {
		generic_error(`Invalid operation: ${op}`);
		return "";
	}

	op = third_precedence(op_copy);
	return op;
}

function third_precedence(op: string) {
	let op_copy = op;

	// const third_precedence_regex =
	// 	/([+-]?[\d]+[.]?([\d])*|(true|false))[+-]([+-]?[\d]+[.]?([\d])*|(true|false))/;

	const third_precedence_regex =
		/(["][^"]*"|['][^']*'|[+-]?\d+[.]?\d*|true|false)[+-](["][^"]*"|['][^']*'|[+-]?\d+[.]?\d*|true|false)/;

	while (third_precedence_regex.test(op_copy)) {
		//@ts-ignore
		const eq = op_copy.match(third_precedence_regex)[0];

		const eq_copy = eq.replace(/(\d+\.?\d*[-])(\d+\.?\d*)/, "$1+$2");

		const args = eq_copy.match(
			/(["][^"]*"|['][^']*'|[-+]?\d+[.]?\d*|true|false)/g
		) || [""];

		const operator = op_copy.match(/(?<=.)[-+]/)?.[0];

		let operand1: number, operand2: number;

		switch (operator) {
			case "+":
				if (string_regex.test(args[0]) || string_regex.test(args[1])) {
					//@ts-expect-error
					let [op1, op2] = op_copy.match(
						/(["][^"]*"|['][^']*'|[-]?\d+[.]?\d*|true|false)/g
					);

					op1 = op1.replaceAll(/^['"]|['"]$/g, "");
					op2 = op2.replaceAll(/^['"]|['"]$/g, "");

					op_copy = op_copy.replace(eq, `"${op1 + op2}"`);
					break;
				}

				operand1 = float_regex.test(args[0])
					? parseFloat(args[0])
					: parseInt(args[0]);
				operand2 = float_regex.test(args[1])
					? parseFloat(args[1])
					: parseInt(args[1]);

				// console.log(operand1, operand2, args);

				op_copy = op_copy.replace(eq, (operand1 + operand2).toString());
				break;
			case "-":
				if (string_regex.test(args[0]) || string_regex.test(args[1])) {
					generic_error(`Invalid operation: ${op}`);
					return "";
				}
				operand1 = float_regex.test(args[0])
					? parseFloat(args[0])
					: parseInt(args[0]);
				operand2 = float_regex.test(args[1])
					? parseFloat(args[1])
					: parseInt(args[1]);

				// console.log(operand1, operand2, operator);

				op_copy = op_copy.replace(eq, (operand1 - operand2).toString());
				break;
			default:
				break;
		}
	}

	// op_copy = op_copy.replaceAll(/^['"]|['"]$/g, "");

	op = fourth_precedence(op_copy);

	return op;
}

function fourth_precedence(op: string) {
	let op_copy = op;

	const fourth_precedence_regex =
		/[+-]?[\d]+[.]?([\d])*([<>][=]?)[+-]?[\d]+[.]?([\d])*/;

	while (fourth_precedence_regex.test(op_copy)) {
		//@ts-ignore
		const eq = op_copy.match(fourth_precedence_regex)[0];

		const args = eq.split(/[<>][=]?/);

		//@ts-ignore
		const operator = op_copy.match(/[<>][=]?/)[0];

		let operand1: number, operand2: number;

		operand1 = float_regex.test(args[0])
			? parseFloat(args[0])
			: parseInt(args[0]);
		operand2 = float_regex.test(args[1])
			? parseFloat(args[1])
			: parseInt(args[1]);

		switch (operator) {
			case ">":
				op_copy = op_copy.replace(eq, (operand1 > operand2).toString());
				break;

			case ">=":
				op_copy = op_copy.replace(eq, (operand1 >= operand2).toString());

				break;
			case "<=":
				op_copy = op_copy.replace(eq, (operand1 <= operand2).toString());

				break;
			case "<":
				op_copy = op_copy.replace(eq, (operand1 < operand2).toString());

				break;
		}
	}

	if (/[<>][=]?/.test(op_copy)) {
		// console.log("here");
		generic_error(`Invalid operation: ${op}`);
		return "";
	}

	op = fifth_precedence(op_copy);

	return op;
}

function fifth_precedence(op: string) {
	let op_copy = op;
	const fifth_precedence_regex =
		/(["][^"]*"|['][^']*'|[+-]?[\d]+[.]?[\d]*|true|false)[!=][=](["][^"]*"|['][^']*'|[+-]?[\d]+[.]?[\d]*|true|false)/;

	while (fifth_precedence_regex.test(op_copy)) {
		//@ts-ignore
		const eq = op_copy.match(fifth_precedence_regex)[0];

		const args = eq.split(/[!=][=]/);

		//@ts-ignore
		const operator = op_copy.match(/[!=][=]/)[0];

		// console.log(args, operator);

		let operand1: number | boolean | string,
			operand2: number | boolean | string;

		if (number_regex.test(args[0])) {
			operand1 = parseFloat(args[0]);
		} else if (args[0] == "true" || args[0] == "false") {
			operand1 = args[0] == "true" ? true : false;
		} else {
			operand1 = args[0].substring(1, args[0].length - 1);
		}

		if (number_regex.test(args[1])) {
			operand2 = parseFloat(args[1]);
		} else if (args[1] == "true" || args[1] == "false") {
			operand2 = args[1] == "true" ? true : false;
		} else {
			operand2 = args[1].substring(1, args[1].length - 1);
		}

		// console.log(operand1, operand2);

		switch (operator) {
			case "==":
				op_copy = op_copy.replace(eq, (operand1 == operand2).toString());
				break;

			case "!=":
				op_copy = op_copy.replace(eq, (operand1 != operand2).toString());
				break;
		}
	}
	op = and_precedence(op_copy);

	return op;
}

function and_precedence(op: string) {
	let op_copy = op;
	const and_precedence_regex = /(true|false)&(true|false)/;

	while (and_precedence_regex.test(op_copy)) {
		//@ts-ignore
		const eq = op_copy.match(and_precedence_regex)[0];

		const args = eq.split(/&/);

		//@ts-ignore
		const operator = op_copy.match(/&/)[0];

		let operand1: number | boolean, operand2: number | boolean;

		operand1 = args[0] == "true" ? true : false;
		operand2 = args[1] == "true" ? true : false;

		switch (operator) {
			case "&":
				op_copy = op_copy.replace(eq, (operand1 && operand2).toString());
				break;
		}
	}

	if (/&/.test(op_copy)) {
		generic_error(`Invalid operation: ${op}`);
		return "";
	}

	op = or_precedence(op_copy);
	// op = op_copy;

	return op;
}

function or_precedence(op: string) {
	let op_copy = op;
	const or_precedence_regex = /(true|false)\|(true|false)/;

	while (or_precedence_regex.test(op_copy)) {
		//@ts-ignore
		const eq = op_copy.match(or_precedence_regex)[0];

		const args = eq.split(/\|/);

		//@ts-ignore
		const operator = op_copy.match(/\|/)[0];

		let operand1: number | boolean, operand2: number | boolean;

		operand1 = args[0] == "true" ? true : false;
		operand2 = args[1] == "true" ? true : false;

		// console.log(operand1, operand2);

		switch (operator) {
			case "|":
				op_copy = op_copy.replace(eq, (operand1 || operand2).toString());
				break;
		}
	}

	if (/\|/.test(op_copy)) {
		generic_error(`Invalid operation: ${op}`);
		return "";
	}

	op = op_copy;

	return op;
}

function get_all_special_characters(op: string) {
	const characters = op.replaceAll(
		/(["][^"]*"|['][^']*')|([+-]?\d+[.]?(\d)*)|(true|false)/g,
		""
	);
	if (/[^!()*/%\-+><=|&\s]/.test(characters)) {
		const char = characters.match(/[^!()*/%\-+><=|&\s]/)?.[0];
		generic_error(`Unknown character found in opertaion: ${char}`);
		return true;
	}
	return false;
}

function validate_operations(op: string) {
	// using = instead of ==
	if (/(?<![><=!])=(?=[^=])/.test(op)) {
		generic_error(`Use == for equal to instead of = in ${op}`);
		return false;
	}
	return true;
}


export function end_program(){
    store.dispatch(interrupt_program());
	store.dispatch(move_program_counter(0));
	store.dispatch(pause_terminal());
}