import { combineReducers, configureStore } from "@reduxjs/toolkit";
import tabReducer from "../reducers/tabs";
import folderReducer from "../reducers/folders";

export default configureStore({
	reducer: {
		tabs: tabReducer,
        folder: folderReducer
	},
});
