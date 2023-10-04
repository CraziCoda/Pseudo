import { get_files } from "@/functions/folder";
import { createSlice } from "@reduxjs/toolkit";

export interface IFolderSlice {
	path: string | null;
	files: string[];
}

const iniitialState: IFolderSlice = {
	path: null,
	files: [],
};

const folderSlice = createSlice({
	name: "folder",
	initialState: iniitialState,
	reducers: {
		set_folder: (state, { payload }: { payload: string }) => {
			state.path = payload;
		},
		set_files: (state, { payload }: { payload: string[] }) => {
			state.files = [...payload];
		},
	},
});

export const { set_folder, set_files } = folderSlice.actions;

export default folderSlice.reducer;
