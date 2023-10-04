import { createSlice } from "@reduxjs/toolkit";

interface ITabsSlice {
	tabs: string[];
	active: number;
}

const iniitialState: ITabsSlice = {
	tabs: ["default"],
	active: 0,
};

const tabsSlice = createSlice({
	name: "tabs",
	initialState: iniitialState,
	reducers: {
		/**
		 * closes a tab on main window
		 * @param payload is the index of the tab to close
		 */
		closeTab: (state, { payload }: { payload: number }) => {
			if (payload == state.active) {
				if (payload == 0 && state.tabs.length > 1) {
					state.tabs.splice(payload, 1);  
				} else if (payload == state.tabs.length - 1 && state.tabs.length > 1) {
					state.active -= 1;
					state.tabs.splice(payload, 1);
				} else if (state.tabs.length == 1) {
					state.tabs.splice(payload, 1);
					state.active = -1;
                    state.tabs = ['blank']
				} else {
					state.tabs.splice(payload, 1);
				}
			} else {
				if (payload < state.active) {
					state.tabs.splice(payload, 1);
					state.active -= 1;
				} else {
					state.tabs.splice(payload, 1);
				}
			}
		},

		/**
		 * adds a new tab to main window
		 * @param payload it is the path to the file to be add
		 */
		addTab: (state, { payload }: { payload: string }) => {
			if (state.tabs.includes(payload)) {
				state.active = state.tabs.indexOf(payload);
				return;
			}
			state.tabs.push(payload);
			state.active = state.tabs.indexOf(payload);
		},

		/**
		 * opens a tab to main window
		 * @param payload is the index of the tab to close
		 */
		openTab: (state, { payload }: { payload: number }) => {
			// console.log("Open");
			state.active = payload;
		},
	},
});

export const { closeTab, openTab, addTab } = tabsSlice.actions;

export default tabsSlice.reducer;
