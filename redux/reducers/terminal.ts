import { createSlice } from "@reduxjs/toolkit";
import { list } from "postcss";

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
		},
	},
});

export const { add_to_list, clear_terminal } = terminalSlice.actions;

export default terminalSlice.reducer;
