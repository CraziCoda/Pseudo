import { createSlice } from "@reduxjs/toolkit";

export interface ITab {
	path: string;
	saved?: boolean;
	content?: string;
}

interface ITabsSlice {
	tabs: ITab[];
	active: number;
}

const iniitialState: ITabsSlice = {
	tabs: [{ path: "default", saved: true }],
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
					state.active = 0;
					state.tabs = [{ path: "default", saved: true }];
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
		addTab: (state, { payload }: { payload: ITab }) => {
			const index = state.tabs.findIndex((tab) => tab.path == payload.path);

			if (index != -1) {
				state.active = index;
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

		editContent: (state, { payload }: { payload: string }) => {
			state.tabs[state.active].content = payload;
			state.tabs[state.active].saved = false;
		},

		saveContent: (state) => {
			state.tabs[state.active].saved = true;
		},
	},
});

export const { closeTab, openTab, addTab, editContent, saveContent } =
	tabsSlice.actions;

export default tabsSlice.reducer;
function err(reason: any): PromiseLike<never> {
	throw new Error("Function not implemented.");
}
