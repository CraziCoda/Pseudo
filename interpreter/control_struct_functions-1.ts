// export function match_if_block(src: string) {
// 	const lines = src.split("\n");
// 	const cond_keywords = ["if", "else if", "else", "endif"];
// 	const cond_arr = [];

// 	for (let i = 0; i < lines.length; i++) {
// 		let line = lines[i];
// 		if (line.startsWith("//") || line == "") continue;
// 		// trim and remove comments
// 		line = line.trim().replace(/\/\/.*/g, "");
// 		// remove excess spaces
// 		line = line.match(/["][^"]*"|['][^']*'|\S+/g)?.join(" ") as string;
// 		// seperate combined characters
// 		line = line.replace(/([^\w"']+|["][^"]*["]|['][^']*['])/g, " $1 ");

// 		const first_token =
// 			line.split(/\s+/)?.[0] == "else" && line.split(/\s+/)?.[1] == "if"
// 				? "else if"
// 				: line.split(/\s+/)?.[0];

// 		if (cond_keywords.includes(first_token)) {
// 			const cond_line = {
// 				name: first_token,
// 				line: i,
// 			};

// 			cond_arr.push(cond_line);
// 		}
// 	}

// 	verify_if_matches(cond_arr);
// 	return cond_arr;
// }

function verify_if_matches(
	matches: {
		name: string;
		line: number;
	}[]
) {
	let current_level = 0;

	for (let i = 0; i < matches.length; i++) {
		const match = matches[i];

		if (match.name == "if") {
			current_level++;
		}

		if (match.name == "endif") {
			current_level--;
		}
	}

	return current_level == 0;
}

export function preprocess_if(lines: string[]) {
	const cond_keywords = ["if", "else if", "else", "endif"];
	const if_lines: { code: string; line: number; level: number }[] = [];
	let code = "";
	let current_level = 0;

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (line.startsWith("//") || line == "") continue;
		// trim and remove comments
		line = line.trim().replace(/\/\/.*/g, "");
		// remove excess spaces
		line = line.match(/["][^"]*"|['][^']*'|\S+/g)?.join(" ") as string;
		// seperate combined characters
		line = line.replace(/([^\w"']+|["][^"]*["]|['][^']*['])/g, " $1 ");

		const first_token =
			line.split(/\s+/)?.[0] == "else" && line.split(/\s+/)?.[1] == "if"
				? "else if"
				: line.split(/\s+/)?.[0];

		if (first_token == "if") current_level++;

		if (current_level >= 1)
			if_lines.push({ code: line, line: i + 1, level: current_level });

		if (first_token == "endif") {
			current_level--;
		}
	}

	if (current_level == 0) {
		console.log(if_lines);
	} else {
	}
}
function match_block(
	src: string,
	start: string,
	end: string,
	level: number = 1
) {
	const lines = src.split("\n");
	let current_level = 0;
	let matched_string = "";
	const matches: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (line.startsWith("//") || line == "") continue;
		// trim and remove comments
		line = line.trim().replace(/\/\/.*/g, "");
		// remove excess spaces
		line = line.match(/["][^"]*"|['][^']*'|\S+/g)?.join(" ") as string;
		// seperate combined characters
		line = line?.replace(/([^\w"']+|["][^"]*["]|['][^']*['])/g, " $1 ") || "";

		if (!/\$\s*\d(?=\n)|\$\s*\d+$/.test(line)) line = `${line} $${i + 1}`;

		// remove space between $ and  line 10
		line = line?.replace(/(?<=\$)\s+(?=\d+)/g, "");

		const first_token =
			line.split(/\s+/)?.[0] == "else" && line.split(/\s+/)?.[1] == "if"
				? "else if"
				: line.split(/\s+/)?.[0];

		if (first_token == start) current_level++;

		if (current_level >= level) matched_string += line + "\n";

		if (first_token == end) {
			current_level--;
			if (current_level < level) {
				matches.push(matched_string);
				matched_string = "";
			}
		}
	}
	if (current_level != 0) return null;
	return matches;
}

function match_lines_no(src: string) {
	const matches = src.match(/^p-.*((?=\n))/gm) || [];
	let end: number;

	if (matches.length < 1) return [];

	//@ts-expect-error
	end = parseInt(matches[matches.length - 1].match(/(?<=\$)\d+$/)?.[0]);

	console.log(matches);
}

export function get_inner_most_if(src: string) {
	const if_statements = match_block(src, "if", "endif");
	const src_lines = src.split("\n");

	if (if_statements == null) {
		//errror
		return;
	}

	for (let i = 0; i < if_statements.length; i++) {
		let statement = if_statements[i];
		const statement_arr = statement.split("\n");
		statement_arr.shift();
		statement_arr.pop();
		statement_arr.pop();

		// console.log(statement);

		let curr_statement = get_inner_most_if(statement_arr.join("\n"));
		// console.log(curr_statement);

		// if (curr_statement) match_lines_no(curr_statement);
		const conds = get_if_blocks(statement);

		for (let j = 0; j < conds.length - 1; j++) {
			let line_no = conds[j].line.match(/\$\s*\d(?=\n)|\$\s*\d+$/)?.[0];
			line_no = line_no?.replace(/\$\s*/, "") as string;
			src_lines[j] = conds[j].update;
		}
	}

	src = src_lines.join("\n");

	return src;
}

export function get_if_blocks(src: string) {
	const lines = src.split("\n");
	const cond_keywords = ["if", "else if", "else", "endif"];
	const cond_arr = [];
	let current_level = 0;

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (line.startsWith("//") || line == "") continue;
		// trim and remove comments
		line = line.trim().replace(/\/\/.*/g, "");
		// remove excess spaces
		line = line.match(/["][^"]*"|['][^']*'|\S+/g)?.join(" ") as string;
		// seperate combined characters
		line = line.replace(/([^\w"']+|["][^"]*["]|['][^']*['])/g, " $1 ");

		// remove space between $ and  line 10
		line = line?.replace(/(?<=\$)\s+(?=\d+)/g, "");

		const first_token =
			line.split(/\s+/)?.[0] == "else" && line.split(/\s+/)?.[1] == "if"
				? "else if"
				: line.split(/\s+/)?.[0];

		if (cond_keywords.includes(first_token)) {
			const cond_line = {
				name: first_token,
				line: line,
				update: "p-",
			};

			cond_arr.push(cond_line);
		}
	}
	// console.log(cond_arr);
	for (let i = 0; i < cond_arr.length ; i++) {
		if (cond_arr[i].name == "endif") {
			continue;
		}
		const next_line = cond_arr[i + 1].line.match(
			/\$\s*\d(?=\n)|\$\s*\d+$/
		)?.[0];

		cond_arr[i].update += cond_arr[i].line + next_line;
		// console.log(cond_arr[i].update);
	}
	return cond_arr;

	// return lines;
}
