import {
	add_instruction,
	add_scope_path,
	exit_scope,
	replace_scope_path,
	setup,
} from "@/redux/reducers/interpreter";
import store from "../redux/store/app";

import {
	CommandI,
	get_keyword_type,
	identifier_regex,
	pseudo_actions,
	pseudo_keywords,
} from "./program";

export function generate_instructions(src: string) {
	store.dispatch(setup(src));

	const lines = src.split("\n");

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		// this will clear source code given
		if (line.startsWith("//") || line == "") continue;

		// trim and remove comments
		line = line.trim().replace(/\/\/.*/g, "");

		// seperate combined characters
		line = line.replace(/([^\w"']+|["][^"]*["]|['][^']*['])/g, " $1 ");

		// excess spaces
		// line = line.replace(/\s+/g, " ");
		line = line.match(/["][^"]*"|['][^']*'|\S+/g)?.join(" ") as string;

		line = format_lines(line);

		const commands = decode_instruction(line, i);

		commands.forEach((command) => {
			store.dispatch(add_instruction(command));
		});
	}

	// console.log(store.getState().interpreter.executable);
}

function format_lines(line: string) {
	let new_line = line.replace(/^whileend/i, "endwhile");

	new_line = new_line.replace(
		/(integer|float|string|double|bool|boolean|char)s/i,
		"$1"
	);

	return new_line;
}

function decode_instruction(line: string, index: number) {
	const commands: CommandI[] = [];
	if (/^[a-zA-Z_]\w*/.test(line)) {
		const first_token = line
			?.match(/^[a-zA-Z_]\w*/)?.[0]
			?.toLowerCase() as string;
		// Check if it is a keyword
		if (pseudo_keywords.includes(first_token)) {
			// work on if keywords
			const first_token = line
				.match(/["][^"]*"|['][^']*'|\S+/g)
				?.join(" ")
				.match(/^[a-zA-Z_]\w+(\s+if)?/)?.[0]
				?.toLowerCase() as string;

			const if_cond_keywords = ["if", "else if", "else", "endif"];

			const loop_keywords = [
				"while",
				"do",
				"for",
				"repeat",
				"until",
				"endfor",
				"endwhile",
			];

			let action: pseudo_actions;

			if (if_cond_keywords.includes(first_token)) {
				if (first_token == "if") {
					store.dispatch(add_scope_path("if" + (index + 1)));
					action = "jmpif";
				} else if (first_token == "endif") {
					store.dispatch(exit_scope());
					action = "exit_scope";
				} else {
					store.dispatch(replace_scope_path(first_token + (index + 1)));
					action = first_token == "else" ? "jmpend" : "jmpelif";
				}

				const args = line.replace(/(if|else\s+if|else|endif)\s*/i, "");

				// console.log(action, args, index + 1);
				commands.push({
					operation: action,
					args,
					line: index + 1,
					scope: store.getState().interpreter.scope_path.join("/"),
				});
			} else if (loop_keywords.includes(first_token)) {
				let action: pseudo_actions = "";

				const token_action = {
					for: "startfor",
					do: "startdo",
					repeat: "startrepeat",
				};

				if (["do", "for", "repeat"].includes(first_token)) {
					//@ts-expect-error
					action = token_action[first_token];
					store.dispatch(add_scope_path(first_token + (index + 1)));
				} else if (["endfor", "endwhile", "until"].includes(first_token)) {
					line = line + " " + store.getState().interpreter.scope_path.join("/");
					action = first_token as pseudo_actions;
					store.dispatch(exit_scope());
				} else if (first_token == "while") {
					const current_scope = store
						.getState()
						.interpreter.scope_path.join("/");
					const last = current_scope.split("/").pop();

					if (last?.includes("do")) {
						line =
							line + " " + store.getState().interpreter.scope_path.join("/");
						store.dispatch(exit_scope());
						action = "enddo";
					} else {
						store.dispatch(add_scope_path(first_token + (index + 1)));
						action = "startwhile";
					}
				}

				const args = line.replace(/^[a-zA-Z]\w*/, "");

				commands.push({
					operation: action,
					args,
					line: index + 1,
					scope: store.getState().interpreter.scope_path.join("/"),
				});
			} else {
				const first_token = line.match(/^[a-zA-Z_]\w*/)?.[0] as string;

				const k_type = get_keyword_type(first_token);

				const args = line.replace(first_token, "").trim();

				commands.push({
					operation: k_type,
					args,
					line: index + 1,
					scope: store.getState().interpreter.scope_path.join("/"),
				});
			}
		} else if (identifier_regex.test(first_token)) {
			const second_token = line?.split(" ")[1];

			if (second_token == "=") {
				const args = line.replace(/=/, "");
				commands.push({
					operation: "assignment",
					args,
					line: index + 1,
					scope: store.getState().interpreter.scope_path.join("/"),
				});
			}
		}
	}

	return commands;
}
