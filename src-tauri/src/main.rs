// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
    let new_project = CustomMenuItem::new("new_project".to_string(), "New Project");

    let open_project = CustomMenuItem::new("open_project".to_string(), "Open Project");

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

    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .menu(menu)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
