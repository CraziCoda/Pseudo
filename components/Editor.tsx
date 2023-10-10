import { editor_theme, lang_tokens } from "@/config/editor";
import { ITab, editContent, saveContent } from "@/redux/reducers/tabs";
import { Editor, BeforeMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CodeEditor() {
	const dispatch = useDispatch();
	const tabs = useSelector(
		({ tabs }: { tabs: { tabs: ITab[]; active: number } }) => tabs
	);

	const [current_text, setText] = useState("");
	const [save, setSave] = useState(false);

	useEffect(() => {
		if (save) save_file();
		setSave(false);
	}, [current_text]);

	async function save_file() {
		const tauri_fs = import("@tauri-apps/api/fs");
		console.log(tabs.tabs[tabs.active].path, tabs.active);
		try {
			(await tauri_fs).writeFile(
				tabs.tabs[tabs.active].path,
				tabs.tabs[tabs.active]?.content as string
			);
		} catch (err) {
			console.log(err);
		}
	}

	function handleEditorWillMount(
		monaco: typeof import("/home/killcode/Documents/projects/pseudo/node_modules/monaco-editor/esm/vs/editor/editor.api")
	) {
		console.log("Will mount");
		monaco.languages.register({ id: "pseudocode" });
		monaco.languages.setMonarchTokensProvider("pseudocode", lang_tokens);
		monaco.editor.defineTheme("pseudocode-theme", editor_theme);

		// Shortcut commands
		monaco.editor.addEditorAction({
			id: "save",
			label: "Save",
			contextMenuGroupId: "1_modification",
			keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
			run: async (editor) => {
				setSave(true);
				setText(editor.getValue());
				dispatch(saveContent());
			},
		});
	}

	return (
		<Editor
			className="flex overflow-y-auto"
			height="100%"
			defaultLanguage="pseudocode"
			defaultValue="// some comment"
			beforeMount={handleEditorWillMount}
			theme="pseudocode-theme"
			value={tabs.tabs[tabs.active].content}
			onChange={(text) => {
				if (text) {
					dispatch(editContent(text));
				}
			}}
		/>
	);
}
