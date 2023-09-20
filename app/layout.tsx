"use client";

import store from "@/redux/store/app";
import "./globals.css";
import { Provider } from "react-redux";

export default function RootLayout({
	children,
	activitybar,
	primarysidebar,
	secondarysidebar,
}: {
	children: React.ReactNode;
	activitybar: React.ReactNode;
	primarysidebar: React.ReactNode;
	secondarysidebar: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="flex flex-row w-full justify-normal select-none">
				<Provider store={store}>
					{activitybar}
					{primarysidebar}
					{children}
					{secondarysidebar}
				</Provider>
			</body>
		</html>
	);
}
