import { combineReducers, configureStore } from "@reduxjs/toolkit";
import tabReducer from "../reducers/tabs";
import folderReducer from "../reducers/folders";
import interpreterReducer from "../reducers/interpreter";

export default configureStore({
	reducer: {
		tabs: tabReducer,
		folder: folderReducer,
		interpreter: interpreterReducer,
	},
});
