import { combineReducers, configureStore } from "@reduxjs/toolkit";
import tabReducer from "../reducers/tabs";

export default configureStore({
	reducer: {
		tabs: tabReducer,
	},
});
