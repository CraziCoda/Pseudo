import {
	CommandI,
	VariableI,
	data_type_t,
	get_keyword_type,
	idenitfy_token,
	pseudo_keyword_type,
	pseudo_keywords,
	select_function,
} from "@/interpreter/program";
import { createSlice } from "@reduxjs/toolkit";

export interface IInterpreterSlice {
	source_code: string;
	program_counter: number;
	executable: CommandI[];
	variables: VariableI[];
	current_scope: string;
}

const iniitialState: IInterpreterSlice = {
	source_code: "",
	program_counter: 0,
	executable: [],
	variables: [],
	current_scope: "global",
};

const interpreterSlice = createSlice({
	name: "run",
	initialState: iniitialState,

	reducers: {
		generate_instructions: (state, { payload }: { payload: string }) => {
			state.source_code = payload;

			const lines = payload.split("\n");

			lines.forEach((line, index) => {
				// this will clear source code given
				if (line.startsWith("//") || line == "") return;

				// trim and remove comments
				line = line.trim().replace(/\/\/.*/g, "");

				// excess spaces
				line = line.replace(/\s+/g, " ");

				const command = decode_instructions(index, line);

				if (command) state.executable.push(command);
			});
		},

		move_program_counter: (state, { payload }: { payload: number }) => {
			state.program_counter = payload;
		},

		add_variables: (state, { payload }: { payload: VariableI[] }) => {
			state.variables.push(...payload);
		},

		add_variable: (state, { payload }: { payload: VariableI }) => {
			state.variables.push(payload);
		},

		assign_variable: (
			state,
			{ payload }: { payload: { name: string; value: any; type: data_type_t } }
		) => {
			const variable = state.variables.find((val) => val.name == payload.name);

			if (variable) {
				variable.value = payload.value;
				variable.type = payload.type;
			}

			console.log(variable?.name, variable?.type, variable?.value);
		},
	},
});

function decode_instructions(index: number, line: string): CommandI | void {
	// const tokens = line.split(" ");
	const tokens = line.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);

	if (tokens == null) return;

	const token_1 = idenitfy_token(tokens[0]);

	if (token_1?.type == "keyword") {
		const k_type = get_keyword_type(token_1.name);

		// remove the command
		tokens.shift();

		const args = tokens.join(" ");

		const command: CommandI = {
			operation: k_type,
			args,
			line: index + 1,
		};

		return command;

		// console.log(command);
	} else if (token_1?.type == "identifier" && tokens.length > 2) {
		const token_2 = tokens[1];

		// remove identifier
		tokens.shift();

		if (token_2 == "=") {
			// remove '='
			tokens.shift();

			const args = token_1.name + " " + tokens.join(" ");
			const command: CommandI = {
				operation: "assignment",
				args,
				line: index + 1,
			};

			return command;

			// console.log(command);
		}
	}
}

export const {
	generate_instructions,
	move_program_counter,
	add_variables,
	add_variable,
	assign_variable,
} = interpreterSlice.actions;
export default interpreterSlice.reducer;
