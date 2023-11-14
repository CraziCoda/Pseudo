import { createSlice } from "@reduxjs/toolkit";
import { MutableRefObject } from "react";

export interface ITerminalSlice {
	list: list_type[];
	pause?: boolean;
}

export type list_type = {
	type: "output" | "input";
	values: any[];
	isError?: boolean;
};

const iniitialState: ITerminalSlice = {
	list: [],
};

const terminalSlice = createSlice({
	name: "terminal",
	initialState: iniitialState,
	reducers: {
		add_to_list: (state, { payload }: { payload: list_type }) => {
			if (!state.pause) state.list.push(payload);
		},

		clear_terminal: (state) => {
			state.list = [];
			console.log("Clear the terminal");
			state.pause = false;
		},
		change_current_input_to_output: (
			state,
			{ payload }: { payload: string }
		) => {
			state.list.pop();
			state.list.push({ type: "output", values: [payload] });
		},

		pause_terminal: (state) => {
			state.pause = true;
		},
	},
});

export const {
	add_to_list,
	clear_terminal,
	change_current_input_to_output,
	pause_terminal,
} = terminalSlice.actions;

export default terminalSlice.reducer;
