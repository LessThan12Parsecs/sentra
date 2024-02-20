// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn center_screen(app: &tauri::App) {
  if let Some(main_window) = app.get_window("main") {
    main_window.center().expect("Window couldn't be centered");
  }
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      center_screen(app);
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
