// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use tauri::{Manager, WindowMenuEvent, Wry};

fn handle_menu_event(event: WindowMenuEvent<Wry>) {
    match event.menu_item_id() {
        "new_file" => {
            // Create new window
            println!("New project clicked");
            event.window().emit("new_folder", {}).unwrap();
        }

        "open_folder" => {
            // Promote for file system
            event.window().emit("open_folder", {}).unwrap();
        }

        "close" => {
            //Close application
            event.window().close().unwrap();
            std::process::exit(0);
        }
        _ => {}
    }
}

fn main() {
    let new_project = CustomMenuItem::new("new_file".to_string(), "Create File");

    let open_project = CustomMenuItem::new("open_folder".to_string(), "Open Folder");

    let close = CustomMenuItem::new("close".to_string(), "Close");

    let file_submenu = Submenu::new(
        "File",
        Menu::new()
            .add_item(new_project)
            .add_item(open_project)
            .add_item(close),
    );

    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_submenu(file_submenu)
        .add_item(CustomMenuItem::new("settings".to_string(), "Settings"));

    let app = tauri::Builder::default();

    app.setup(|app| {
        #[cfg(debug_assertions)]
        {
            let window = app.get_window("main").unwrap();
            window.open_devtools();
            window.close_devtools();
        }
        Ok(())
    })
    .menu(menu)
    .on_menu_event(handle_menu_event)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
