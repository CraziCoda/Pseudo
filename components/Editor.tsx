import { editor_theme, lang_tokens } from "@/config/editor";
import { Editor, BeforeMount } from "@monaco-editor/react";
import { useRef } from "react";

export default function CodeEditor() {
	function handleEditorWillMount(
		monaco: typeof import("/home/killcode/Documents/projects/pseudo/node_modules/monaco-editor/esm/vs/editor/editor.api")
	) {
		console.log("Will mount");
		monaco.languages.register({ id: "pseudocode" });
		monaco.languages.setMonarchTokensProvider("pseudocode", lang_tokens);
		monaco.editor.defineTheme("pseudocode-theme", editor_theme);
	}

	return (
		<Editor
			className="flex overflow-y-auto"
			height="100%"
			defaultLanguage="pseudocode"
			defaultValue="// some comment"
			beforeMount={handleEditorWillMount}
			theme="pseudocode-theme"
		/>
	);
}
