// import {
// 	get_if_blocks,
// 	get_inner_most_if,
// 	preprocess_if,
// } from "@/interpreter/control_struct_functions";
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
	interrupted: boolean;
	scope_path: string[];
}

const iniitialState: IInterpreterSlice = {
	source_code: "",
	program_counter: 0,
	executable: [],
	variables: [],
	current_scope: "global",
	interrupted: false,
	scope_path: ["global"],
};

const interpreterSlice = createSlice({
	name: "run",
	initialState: iniitialState,

	reducers: {
		generate_instructions: (state, { payload }: { payload: string }) => {
			state.source_code = payload;
			state.interrupted = false;
			state.program_counter = 0;
			state.variables = [];
			state.executable = [];
			state.current_scope = "global";

			const lines = payload.split("\n");

			payload = payload.replace(/\/\/.*/g, "");

			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				// this will clear source code given
				if (line.startsWith("//") || line == "") return;

				// trim and remove comments
				line = line.trim().replace(/\/\/.*/g, "");

				// excess spaces
				// line = line.replace(/\s+/g, " ");
				line = line.match(/["][^"]*"|['][^']*'|\S+/g)?.join(" ") as string;

				// seperate combined characters
				line = line.replace(/([^\w"']+|["][^"]*["]|['][^']*['])/g, " $1 ");

				const command = decode_instructions(i, line);

				if (command) state.executable.push(command);
			}
		},

		setup: (state, { payload }: { payload: string }) => {
			state.source_code = payload;
			state.interrupted = false;
			state.program_counter = 0;
			state.variables = [];
			state.executable = [];
			state.current_scope = "global";
			state.scope_path = ["global"];
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

			// console.log(variable?.name, variable?.type, variable?.value);
		},

		interrupt_program: (state) => {
			state.interrupted = true;
		},

		uninterrupt_program: (state) => {
			state.interrupted = false;
		},

		replace_scope_path: (state, { payload }: { payload: string }) => {
			state.scope_path.pop();
			state.scope_path.push(payload);
		},

		add_scope_path: (state, { payload }: { payload: string }) => {
			state.scope_path.push(payload);
		},
		exit_scope: (state) => {
			state.scope_path.pop();
		},

		add_instruction: (state, { payload }: { payload: CommandI }) => {
			state.executable.push(payload);
		},
	},
});

function decode_instructions(index: number, line: string): CommandI | void {
	// split characters by spaces except when space is in quotes
	const tokens = line.match(/["][^"]*["]|['][^']*[']|[^\s]+/g);

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
	} else if (token_1?.type == "identifier" && tokens.length >= 2) {
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
		}
	}
}

export const {
	// generate_instructions,
	setup,
	move_program_counter,
	add_variables,
	add_variable,
	assign_variable,
	interrupt_program,
	uninterrupt_program,
	replace_scope_path,
	add_scope_path,
	exit_scope,
	add_instruction,
} = interpreterSlice.actions;
export default interpreterSlice.reducer;
