import subprocess
import json
import shutil
import os
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.config import settings

class BeeService:
    def __init__(self):
        self.cli_cmd = settings.BEE_CLI_CMD
        self.api_url = settings.BEE_API_URL
        self.sync_dir = settings.BEE_SYNC_DIR

    def is_cli_available(self) -> bool:
        return shutil.which(self.cli_cmd) is not None

    def get_status(self) -> Dict[str, Any]:
        """Runs `bee status` to check actual authentication with the Bee Developer API."""
        if not self.is_cli_available():
            return {
                "cli_installed": False,
                "version": None,
                "logged_in": False,
                "api_endpoint": self.api_url,
                "account_info": None,
                "error_message": "Official Bee CLI (@beeai/cli) not found on PATH.",
                "instructions": (
                    "Install the official Bee CLI via: npm install -g @beeai/cli\n"
                    "Then unlock Developer Mode in your Bee app (Settings -> tap version 5 times) and run 'bee login'."
                )
            }

        # Check version
        version = None
        try:
            v_res = subprocess.run([self.cli_cmd, "version"], capture_output=True, text=True, timeout=10)
            if v_res.returncode == 0:
                version = v_res.stdout.strip()
        except Exception:
            pass

        # Check status
        try:
            res = subprocess.run([self.cli_cmd, "status"], capture_output=True, text=True, timeout=15)
            out = res.stdout.strip() + " " + res.stderr.strip()
            
            is_logged_in = "Not logged in" not in out and res.returncode == 0
            
            account_info = None
            if is_logged_in:
                # If logged in, get profile info via `bee me --json`
                me_res = subprocess.run([self.cli_cmd, "me", "--json"], capture_output=True, text=True, timeout=15)
                if me_res.returncode == 0:
                    try:
                        account_info = json.loads(me_res.stdout)
                    except Exception:
                        account_info = {"raw": me_res.stdout.strip()}

            return {
                "cli_installed": True,
                "version": version or "@beeai/cli 0.9.0",
                "logged_in": is_logged_in,
                "api_endpoint": self.api_url,
                "account_info": account_info,
                "error_message": None if is_logged_in else "Not logged in to Bee Developer API.",
                "instructions": (
                    "To connect your physical Bee Wearable or Apple Watch:\n"
                    "1. Open the Bee Wearable App on your phone.\n"
                    "2. Navigate to Settings -> Tap the app version number 5 times to enable Developer Mode.\n"
                    "3. In the terminal run 'bee login --qr' to scan the QR code from the app, or paste your developer token below."
                )
            }
        except subprocess.TimeoutExpired:
            return {
                "cli_installed": True,
                "version": version,
                "logged_in": False,
                "api_endpoint": self.api_url,
                "account_info": None,
                "error_message": "Bee CLI status check timed out.",
                "instructions": "Ensure you have active internet connection to contact https://app-api-developer.ce.bee.amazon.dev"
            }
        except Exception as e:
            return {
                "cli_installed": True,
                "version": version,
                "logged_in": False,
                "api_endpoint": self.api_url,
                "account_info": None,
                "error_message": str(e),
                "instructions": "Run 'bee login' directly in your terminal to authenticate."
            }

    def login_with_token(self, token: str) -> Dict[str, Any]:
        """Authenticate using `bee login --token <token>`."""
        if not self.is_cli_available():
            return {"success": False, "error": "Bee CLI not installed"}
        try:
            res = subprocess.run([self.cli_cmd, "login", "--token", token.strip()], capture_output=True, text=True, timeout=30)
            if res.returncode == 0:
                return {"success": True, "output": res.stdout.strip()}
            else:
                return {"success": False, "error": res.stderr.strip() or res.stdout.strip()}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def fetch_live_recent_record(self) -> Dict[str, Any]:
        """Fetch actual recent conversations using `bee now --json`."""
        if not self.is_cli_available():
            raise RuntimeError("Bee CLI is not installed")
        
        res = subprocess.run([self.cli_cmd, "now", "--json"], capture_output=True, text=True, timeout=20)
        if res.returncode != 0:
            error_msg = res.stderr.strip() or res.stdout.strip()
            raise RuntimeError(f"Bee CLI returned error: {error_msg}")
        
        try:
            data = json.loads(res.stdout)
            return data
        except Exception as e:
            raise RuntimeError(f"Failed to parse Bee CLI JSON output: {e}\nRaw output: {res.stdout}")

    def fetch_conversations_list(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch conversations using `bee conversations list --json`."""
        if not self.is_cli_available():
            raise RuntimeError("Bee CLI is not installed")
        
        res = subprocess.run(
            [self.cli_cmd, "conversations", "list", "--limit", str(limit), "--json"],
            capture_output=True, text=True, timeout=20
        )
        if res.returncode != 0:
            error_msg = res.stderr.strip() or res.stdout.strip()
            raise RuntimeError(f"Bee CLI error: {error_msg}")
        
        try:
            data = json.loads(res.stdout)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and "conversations" in data:
                return data["conversations"]
            return [data]
        except Exception as e:
            raise RuntimeError(f"Failed to parse conversations list: {e}")

    def fetch_conversation_transcript(self, conversation_id: str) -> Dict[str, Any]:
        """Fetch conversation transcript using `bee conversations transcript <id> --json`."""
        res = subprocess.run(
            [self.cli_cmd, "conversations", "transcript", conversation_id, "--json"],
            capture_output=True, text=True, timeout=20
        )
        if res.returncode != 0:
            raise RuntimeError(f"Bee transcript error: {res.stderr.strip() or res.stdout.strip()}")
        return json.loads(res.stdout)

    def trigger_bee_sync(self, recent_days: int = 7) -> Dict[str, Any]:
        """Runs `bee sync` to local directory."""
        if not self.is_cli_available():
            raise RuntimeError("Bee CLI is not installed")
        
        res = subprocess.run(
            [self.cli_cmd, "sync", "--output", str(self.sync_dir), "--recent-days", str(recent_days)],
            capture_output=True, text=True, timeout=60
        )
        return {
            "exit_code": res.returncode,
            "stdout": res.stdout,
            "stderr": res.stderr,
            "output_dir": str(self.sync_dir)
        }

bee_service = BeeService()
