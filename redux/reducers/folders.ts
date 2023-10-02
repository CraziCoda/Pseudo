import { get_files } from "@/functions/folder";
import { createSlice } from "@reduxjs/toolkit";

interface IFolderSlice {
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
			const results = get_files(payload);
			results.then((files) => {
				state.files = [...files];
			});
		},
	},
});

export const { set_folder } = folderSlice.actions;

export default folderSlice.reducer;
