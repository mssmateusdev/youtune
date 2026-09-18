use discord_rich_presence::{DiscordIpc, DiscordIpcClient};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

const DISCORD_CLIENT_ID: &str = "1515682467154100344";
const ACTIVITY_NAME: &str = "YouTune";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiscordPresenceData {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub artwork_url: Option<String>,
    pub song_url: Option<String>,
    pub artist_url: Option<String>,
    pub album_url: Option<String>,
    pub duration: u64,
    pub current_time: u64,
    pub is_playing: bool,
}

pub struct DiscordRpcManager {
    client: Arc<Mutex<Option<DiscordIpcClient>>>,
    connected: Arc<Mutex<bool>>,
}

impl DiscordRpcManager {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Mutex::new(None)),
            connected: Arc::new(Mutex::new(false)),
        }
    }

    /// Initialize Discord RPC connection
    pub fn connect(&self) -> Result<(), String> {
        let mut client_lock = self.client.lock().map_err(|e| e.to_string())?;

        if client_lock.is_some() {
            return Ok(());
        }

        match DiscordIpcClient::new(DISCORD_CLIENT_ID) {
            Ok(mut client) => {
                if let Err(e) = client.connect() {
                    return Err(format!("Failed to connect to Discord: {}", e));
                }
                *client_lock = Some(client);
                let mut connected = self.connected.lock().map_err(|e| e.to_string())?;
                *connected = true;
                Ok(())
            }
            Err(e) => Err(format!("Failed to create Discord client: {}", e)),
        }
    }

    /// Update Discord presence with current track info
    pub fn update_presence(&self, data: DiscordPresenceData) -> Result<(), String> {
        // Ensure connection exists
        if !*self.connected.lock().map_err(|e| e.to_string())? {
            self.connect()?;
        }

        let mut client_lock = self.client.lock().map_err(|e| e.to_string())?;

        let client = client_lock
            .as_mut()
            .ok_or("Discord client not initialized")?;

        // Calculate progress
        let elapsed = data.current_time;
        let duration = data.duration;

        // Keep owned values alive while building the activity
        let state_str = if data.artist.trim().is_empty() {
            if data.is_playing {
                "YouTune".to_string()
            } else {
                "YouTune (pausado)".to_string()
            }
        } else if data.is_playing {
            data.artist.clone()
        } else {
            format!("{} (pausado)", data.artist)
        };

        let artwork_image = data.artwork_url.clone();
        let artwork_key = artwork_image.as_deref().unwrap_or("app-icon");

        let large_text_str = format!("{} - {}", data.title, data.artist);

        let start_ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64
            - elapsed as i64;
        let end_ts = start_ts + duration as i64;

        /*
         * A música, e não o autor, deve ser o destaque principal ("Listening to {title}").
         * O nome do app serve como fallback caso o título esteja vazio.
         */
        let activity_name = if data.title.trim().is_empty() {
            ACTIVITY_NAME.to_string()
        } else {
            data.title.clone()
        };

        let button_url = data
            .song_url
            .as_deref()
            .unwrap_or("https://music.youtube.com");

        let mut activity = json!({
            "name": activity_name,
            "type": 2,
            "details": data.title,
            "state": state_str,
            "assets": {
                "large_image": artwork_key,
                "large_text": large_text_str,
            },
            "buttons": [
                {
                    "label": "Ouvir no YouTune",
                    "url": button_url,
                }
            ],
        });

        if let Some(song_url) = data.song_url {
            activity["details_url"] = json!(song_url);
        }

        if let Some(artist_url) = data.artist_url {
            activity["state_url"] = json!(artist_url);
        }

        if let Some(album_url) = data.album_url {
            activity["assets"]["large_url"] = json!(album_url);
        }

        /*
         * Timestamps only while playing.
         *
         * Discord does not receive progress updates — it is given a start and an end and runs
         * the clock itself. Leaving them on a paused track means the bar keeps advancing and
         * the song keeps "finishing" on other people's screens while the audio sits still, so
         * pausing had no visible effect at all. Dropping them freezes the presence, which is
         * what a pause looks like.
         */
        if duration > 0 && data.is_playing {
            activity["timestamps"] = json!({
                "start": start_ts,
                "end": end_ts,
            });
        }

        let payload = json!({
            "cmd": "SET_ACTIVITY",
            "args": {
                "pid": std::process::id(),
                "activity": activity,
            },
            "nonce": format!("jamc-{}-{}", std::process::id(), start_ts),
        });

        if let Err(e) = client.send(payload, 1) {
            eprintln!("[Discord RPC] Failed to set activity: {}", e);
            *client_lock = None;
            if let Ok(mut connected) = self.connected.lock() {
                *connected = false;
            }
        }

        Ok(())
    }

    /// Clear presence (show idle)
    pub fn clear_presence(&self) -> Result<(), String> {
        if !*self.connected.lock().map_err(|e| e.to_string())? {
            return Ok(());
        }

        let mut client_lock = self.client.lock().map_err(|e| e.to_string())?;
        let client = client_lock
            .as_mut()
            .ok_or("Discord client not initialized")?;

        if let Err(e) = client.clear_activity() {
            eprintln!("[Discord RPC] Failed to clear activity: {}", e);
            *client_lock = None;
            if let Ok(mut connected) = self.connected.lock() {
                *connected = false;
            }
        }

        Ok(())
    }
}

impl Default for DiscordRpcManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_discord_rpc_manager_creation() {
        let manager = DiscordRpcManager::new();
        assert!(!*manager.connected.lock().unwrap());
    }
}
