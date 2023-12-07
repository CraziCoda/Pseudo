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
