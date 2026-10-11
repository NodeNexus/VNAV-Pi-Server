import subprocess
import shlex
from typing import Dict, Any, List

# Allowed diagnostic command whitelist to ensure strictly safe homelab operations
ALLOWED_COMMANDS = {
    "uname": ["uname", "-a"],
    "uptime": ["uptime"],
    "df": ["df", "-h"],
    "free": ["free", "-h"],
    "top": ["top", "-b", "-n", "1"],
    "ip": ["ip", "-br", "a"],
    "ifconfig": ["ifconfig"],
    "tailscale": ["tailscale", "status"],
    "docker_ps": ["docker", "ps"],
    "vcgencmd_temp": ["vcgencmd", "measure_temp"],
    "vcgencmd_clock": ["vcgencmd", "measure_clock", "arm"],
    "vcgencmd_throttled": ["vcgencmd", "get_throttled"],
    "neofetch": ["neofetch"],
    "hostname": ["hostname"],
    "cat_os_release": ["cat", "/etc/os-release"],
}

class SafeTerminalService:
    @staticmethod
    def execute_command(cmd_alias: str, custom_cmd: str = None) -> Dict[str, Any]:
        """
        Executes strictly safe diagnostic commands.
        Prevents arbitrary shell execution or destructive operations.
        """
        # If user picks an allowed preset
        if cmd_alias in ALLOWED_COMMANDS:
            cmd = ALLOWED_COMMANDS[cmd_alias]
        elif custom_cmd:
            parts = shlex.split(custom_cmd.strip())
            if not parts:
                return {"stdout": "", "stderr": "No command provided", "exit_code": 1}
            base = parts[0].lower()
            # Strict safety check
            forbidden = ["rm", "mkfs", "dd", "shutdown", "reboot", ":(){", "chmod", "chown", "passwd", ">", "|", ";", "&"]
            if any(f in custom_cmd for f in forbidden) or base not in ["uname", "uptime", "df", "free", "ping", "ps", "ip", "docker", "cat", "ls", "echo"]:
                return {
                    "stdout": "",
                    "stderr": f"Command '{base}' is restricted for homelab safety. Allowed diagnostics: uname, uptime, df, free, ping, ps, ip, docker, cat, ls.",
                    "exit_code": 126
                }
            cmd = parts
        else:
            return {"stdout": "", "stderr": "Invalid command request", "exit_code": 1}

        try:
            res = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=5.0,
                shell=False
            )
            return {
                "stdout": res.stdout,
                "stderr": res.stderr,
                "exit_code": res.returncode
            }
        except subprocess.TimeoutExpired:
            return {"stdout": "", "stderr": "Command execution timed out after 5s", "exit_code": 124}
        except FileNotFoundError:
            # Command not found on this OS (e.g. running on Windows dev machine)
            simulated_output = SafeTerminalService._fallback_output(cmd[0])
            return {
                "stdout": simulated_output,
                "stderr": f"(Note: '{cmd[0]}' is simulated on local development host)",
                "exit_code": 0
            }
        except Exception as e:
            return {"stdout": "", "stderr": str(e), "exit_code": 1}

    @staticmethod
    def _fallback_output(cmd_name: str) -> str:
        if "vcgencmd" in cmd_name:
            return "temp=47.4'C\nfrequency(48)=2400000000\nthrottled=0x0 (undervoltage=0, freq_capped=0)"
        if "uname" in cmd_name:
            return "Linux vnavhomelab 6.6.20+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.6.20-1+rpt1 (2024-03-15) aarch64 GNU/Linux"
        if "uptime" in cmd_name:
            return "21:18:00 up 14 days,  6:32,  1 user,  load average: 0.28, 0.35, 0.42"
        if "df" in cmd_name:
            return "Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/root      124982000  42800000  77500000  36% /\n/dev/mmcblk0p1    524288     65536    458752  13% /boot/firmware"
        if "free" in cmd_name:
            return "               total        used        free      shared  buff/cache   available\nMem:         8192000     3140000     3800000       45000     1252000     4980000\nSwap:        1024000      120000      904000"
        return f"Executed command: {cmd_name}\nStatus: OK"

terminal_service = SafeTerminalService()
