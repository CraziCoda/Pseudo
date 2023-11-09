import { L } from "@tauri-apps/api/event-41a9edf5";
import { float_regex, number_regex } from "./program";

export function match_string_between_two_characters(
	text: string,
	start: string,
	end: string,
	level: number
): string[] {
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
	return matches;
}
export function work_on_operations(operation: string) {
	const final_op = get_brackets_values(operation);
	console.log("Final:", final_op);
}

function get_brackets_values(op: string) {
	const bracket_operations = match_string_between_two_characters(
		op,
		"(",
		")",
		1
	);

	for (let i = 0; i < bracket_operations.length; i++) {
		const _op = bracket_operations[i];
		let op_ans = get_brackets_values(_op.substring(1, _op.length - 1));

		op_ans = first_precendence(op_ans);

		op = op.replace(_op, op_ans);

		// console.log(op_ans, op, _op);
	}

	return op;
}

function first_precendence(op: string) {
	if (/!/.test(op)) {
		if (/!true|!false/) {
			op = op.replace(/!true/i, "false");
			op = op.replace(/!false/i, "true");
		} else {
			// raise error
		}
	}

	op = second_precedence(op);

	return op;
}

function second_precedence(op: string): string {
	let op_copy = op;

	const second_precedence_regex =
		/([-]?[\d]+[.]?([\d])*|(true|false))[\/*%]([-]?[\d]+[.]?([\d])*|(true|false))/;

	while (second_precedence_regex.test(op_copy)) {
		op_copy = op_copy.replaceAll("true", "1");
		op_copy = op_copy.replaceAll("false", "0");

		//@ts-ignore
		const eq = op_copy.match(second_precedence_regex)[0];

		const args = eq.split(/[/*%]/);

		//@ts-ignore
		const operator = op_copy.match(/[/*%]/)[0];
		let operand1: number, operand2: number;

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
					return op;
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
					return op;
				}

				op_copy = op_copy.replace(eq, (operand1 / operand2).toString());
				break;
			default:
				break;
		}
	}
	op = third_precedence(op_copy);
	return op;
}

function third_precedence(op: string) {
	let op_copy = op;

	const third_precedence_regex =
		/([+-]?[\d]+[.]?([\d])*|(true|false))[+-]([+-]?[\d]+[.]?([\d])*|(true|false))/;

	while (third_precedence_regex.test(op_copy)) {
		op_copy = op_copy.replaceAll("true", "1");
		op_copy = op_copy.replaceAll("false", "0");

		//@ts-ignore
		const eq = op_copy.match(third_precedence_regex)[0];

		const args = eq.split(/(?<=[\d.])[-+]/);
		//@ts-ignore
		const operator = op_copy.match(/(?<=[\d.])[-+]/)[0];
		let operand1: number, operand2: number;

		switch (operator) {
			case "+":
				operand1 = float_regex.test(args[0])
					? parseFloat(args[0])
					: parseInt(args[0]);
				operand2 = float_regex.test(args[1])
					? parseFloat(args[1])
					: parseInt(args[1]);

				op_copy = op_copy.replace(eq, (operand1 + operand2).toString());
				break;
			case "-":
				operand1 = float_regex.test(args[0])
					? parseFloat(args[0])
					: parseInt(args[0]);
				operand2 = float_regex.test(args[1])
					? parseFloat(args[1])
					: parseInt(args[1]);

				// console.log(operand1, operand2);

				op_copy = op_copy.replace(eq, (operand1 - operand2).toString());
				break;
		}

		// console.log(eq, args, operator, op_copy);
	}

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

		// console.log(eq, op_copy);
	}

	op = fifth_precedence(op_copy);

	return op;
}

function fifth_precedence(op: string) {
	let op_copy = op;
	const fifth_precedence_regex =
		/[+-]?[\d]+[.]?([\d])*([!=][=]?)[+-]?[\d]+[.]?([\d])*/;

	while (fifth_precedence_regex.test(op_copy)) {
		//@ts-ignore
		const eq = op_copy.match(fifth_precedence_regex)[0];

		const args = eq.split(/[!=][=]?/);

		//@ts-ignore
		const operator = op_copy.match(/[!=][=]?/)[0];

		let operand1: number, operand2: number;

		operand1 = float_regex.test(args[0])
			? parseFloat(args[0])
			: parseInt(args[0]);
		operand2 = float_regex.test(args[1])
			? parseFloat(args[1])
			: parseInt(args[1]);

		switch (operator) {
			case "==":
				op_copy = op_copy.replace(eq, ((operand1 == operand2)).toString());
				break;

			case "!=":
				op_copy = op_copy.replace(eq, (operand1 != operand2).toString());

				break;
		}

		console.log(eq, op_copy, operand1 == operand2);
	}

	op = op_copy;

	return op;
}
