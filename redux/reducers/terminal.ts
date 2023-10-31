import { createSlice } from "@reduxjs/toolkit";
import { MutableRefObject } from "react";

export interface ITerminalSlice {
	list: list_type[];
}

export type list_type = {
	type: "output" | "input";
	values: any[];
};

const iniitialState: ITerminalSlice = {
	list: [],
};

const terminalSlice = createSlice({
	name: "terminal",
	initialState: iniitialState,
	reducers: {
		add_to_list: (state, { payload }: { payload: list_type }) => {
			state.list.push(payload);
		},

		clear_terminal: (state) => {
			state.list = [];
			console.log("Clear the terminal");
		},
		change_current_input_to_output: (
			state,
			{ payload }: { payload: string }
		) => {
			state.list.pop();
			state.list.push({ type: "output", values: [payload] });
		},
	},
});

export const { add_to_list, clear_terminal, change_current_input_to_output } =
	terminalSlice.actions;

export default terminalSlice.reducer;
