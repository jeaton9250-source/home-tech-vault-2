use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, RunEvent, WindowEvent,
};

pub struct ConnectorRuntimeState {
    pub minimize_to_tray: AtomicBool,
    pub monitoring_paused: AtomicBool,
    pub quitting: AtomicBool,
}

impl ConnectorRuntimeState {
    pub fn new() -> Self {
        Self {
            minimize_to_tray: AtomicBool::new(false),
            monitoring_paused: AtomicBool::new(false),
            quitting: AtomicBool::new(false),
        }
    }
}

pub fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let show_item = MenuItem::with_id(app, "tray-show", "Open Home Tech Vault Connector", true, None::<&str>)?;
    let scan_item = MenuItem::with_id(app, "tray-scan", "Scan My Network", true, None::<&str>)?;
    let pause_item = MenuItem::with_id(app, "tray-pause", "Pause Monitoring", true, None::<&str>)?;
    let resume_item = MenuItem::with_id(app, "tray-resume", "Resume Monitoring", true, None::<&str>)?;
    let updates_item = MenuItem::with_id(app, "tray-updates", "Check for Updates", true, None::<&str>)?;
    let diagnostics_item = MenuItem::with_id(app, "tray-diagnostics", "View Diagnostics", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "tray-quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[&show_item, &scan_item, &pause_item, &resume_item, &updates_item, &diagnostics_item, &quit_item],
    )?;

    let icon = app.default_window_icon().cloned().ok_or_else(|| {
        tauri::Error::from(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Missing default tray icon",
        ))
    })?;

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "tray-show" => show_main_window(app),
            "tray-scan" => {
                let _ = app.emit("connector://scan-requested", ());
            }
            "tray-pause" => {
                if let Some(state) = app.try_state::<ConnectorRuntimeState>() {
                    state.monitoring_paused.store(true, Ordering::SeqCst);
                }
                let _ = app.emit("connector://monitoring-paused", ());
            }
            "tray-resume" => {
                if let Some(state) = app.try_state::<ConnectorRuntimeState>() {
                    state.monitoring_paused.store(false, Ordering::SeqCst);
                }
                let _ = app.emit("connector://monitoring-resumed", ());
            }
            "tray-updates" => {
                let _ = app.emit("connector://check-updates-requested", ());
            }
            "tray-diagnostics" => {
                show_main_window(app);
                let _ = app.emit("connector://diagnostics-requested", ());
            }
            "tray-quit" => {
                if let Some(state) = app.try_state::<ConnectorRuntimeState>() {
                    state.quitting.store(true, Ordering::SeqCst);
                }
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

pub fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

pub fn attach_window_close_handler(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let app_handle = app.clone();
        window.on_window_event(move |event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let state = app_handle.state::<ConnectorRuntimeState>();
                if !state.quitting.load(Ordering::SeqCst)
                    && state.minimize_to_tray.load(Ordering::SeqCst)
                {
                    api.prevent_close();
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
            }
        });
    }
}

pub fn handle_run_event(app: &AppHandle, event: &RunEvent) {
    if let RunEvent::ExitRequested { api, .. } = event {
        let state = app.state::<ConnectorRuntimeState>();
        if !state.quitting.load(Ordering::SeqCst)
            && state.minimize_to_tray.load(Ordering::SeqCst)
        {
            api.prevent_exit();
        }
    }
}

#[tauri::command]
pub fn set_connector_runtime_preferences(
    minimize_to_tray: bool,
    monitoring_paused: bool,
    state: tauri::State<'_, ConnectorRuntimeState>,
) {
    state.minimize_to_tray.store(minimize_to_tray, Ordering::SeqCst);
    state.monitoring_paused.store(monitoring_paused, Ordering::SeqCst);
}

#[tauri::command]
pub fn quit_connector_app(state: tauri::State<'_, ConnectorRuntimeState>, app: AppHandle) {
    state.quitting.store(true, Ordering::SeqCst);
    app.exit(0);
}

#[tauri::command]
pub fn hide_connector_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn show_connector_window(app: AppHandle) -> Result<(), String> {
    show_main_window(&app);
    Ok(())
}
