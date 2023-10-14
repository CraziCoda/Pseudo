"use client";

import store from "@/redux/store/app";
import "./globals.css";
import { Provider } from "react-redux";
import Adjuster from "@/components/Adjuster";

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
			<body className="flex flex-row w-full justify-start select-none">
				<Provider store={store}>
					{activitybar}
					{primarysidebar}
                    {/* <Adjuster direction="vertical"/> */}
					{children}
					{secondarysidebar}
				</Provider>
			</body>
		</html>
	);
}
