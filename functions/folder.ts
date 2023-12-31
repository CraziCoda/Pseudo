import { e } from "@tauri-apps/api/event-41a9edf5";

export const open_folder = async (): Promise<string | null> => {
	const tauri_api = await import("@tauri-apps/api");

	const selected = await tauri_api.dialog.open({
		multiple: false,
		directory: true,
		defaultPath: await tauri_api.path.documentDir(),
	});

	return selected as string | null;
};

export const get_files = async (path: string): Promise<string[]> => {
	const tauri_fs = await import("@tauri-apps/api/fs");
	const entries = await tauri_fs.readDir(path);
	const files: string[] = [];
	for (const entry of entries) {
		// console.log(entry.name);
		if (entry.name?.endsWith(".psc")) files.push(entry.name);
	}

	return files;
};

export const create_file = async (path: string): Promise<boolean> => {
	const tauri_fs = await import("@tauri-apps/api/fs");

	if (await tauri_fs.exists(path)) return false;

	try {
		await tauri_fs.writeFile(path, "// start coding");
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

export const read_file = async (path: string): Promise<string | null> => {
	const tauri_api = await import("@tauri-apps/api");

	try {
		const text = await tauri_api.fs.readTextFile(path);
		return text;
	} catch (err) {
		// log error
		return null;
	}
};

export const delete_file = async (path: string): Promise<boolean> => {
	const tauri_fs = await import("@tauri-apps/api/fs");

	if (await tauri_fs.exists(path)) {
		tauri_fs.removeFile(path);
		return true;
	}
	return false;
};
