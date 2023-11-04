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
		const op_ans = get_brackets_values(_op.substring(1, _op.length - 1));

		op = op.replace(_op, op_ans);
        

		console.log(op_ans, op, _op);
	}

	return op;
}

function first_precendence(op: string) {}
