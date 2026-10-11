import os
import datetime
from typing import List, Dict, Any, Optional
from app.core.config import settings

class SafeFileService:
    def __init__(self, root_dir: Optional[str] = None):
        self.root_dir = os.path.abspath(root_dir or settings.ALLOWED_ROOT_PATH)

    def _resolve_path(self, relative_path: str) -> str:
        # Strip leading slashes to prevent absolute traversal
        clean_rel = relative_path.lstrip("/\\")
        target = os.path.abspath(os.path.join(self.root_dir, clean_rel))
        # Ensure target is within root_dir
        common = os.path.commonpath([self.root_dir, target])
        if common != self.root_dir:
            raise PermissionError("Access denied: Path is outside permitted directory boundaries")
        return target

    def list_directory(self, rel_path: str = "") -> Dict[str, Any]:
        target = self._resolve_path(rel_path)
        if not os.path.exists(target):
            raise FileNotFoundError("Directory not found")
        if not os.path.isdir(target):
            raise ValueError("Target is not a directory")

        items: List[Dict[str, Any]] = []
        for entry in os.scandir(target):
            try:
                stat = entry.stat()
                is_dir = entry.is_dir()
                mod_time = datetime.datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M")
                
                # Rel path relative to root
                entry_rel = os.path.relpath(entry.path, self.root_dir).replace("\\", "/")
                
                items.append({
                    "name": entry.name,
                    "rel_path": entry_rel,
                    "is_dir": is_dir,
                    "size_bytes": 0 if is_dir else stat.st_size,
                    "modified": mod_time,
                    "extension": os.path.splitext(entry.name)[1].lower() if not is_dir else ""
                })
            except Exception:
                continue

        # Sort: directories first, then alphabetically
        items.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))

        current_rel = os.path.relpath(target, self.root_dir).replace("\\", "/")
        if current_rel == ".":
            current_rel = ""

        return {
            "root_name": os.path.basename(self.root_dir),
            "current_path": current_rel,
            "items": items
        }

    def read_file_preview(self, rel_path: str, max_bytes: int = 100_000) -> Dict[str, Any]:
        target = self._resolve_path(rel_path)
        if not os.path.exists(target) or not os.path.isfile(target):
            raise FileNotFoundError("File not found")

        stat = os.stat(target)
        size = stat.st_size
        
        # Determine if binary or text
        ext = os.path.splitext(target)[1].lower()
        is_binary = ext in [".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".zip", ".tar", ".gz", ".db", ".sqlite"]
        
        content = ""
        truncated = False
        
        if not is_binary:
            try:
                with open(target, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read(max_bytes)
                    if size > max_bytes:
                        truncated = True
            except Exception as e:
                content = f"Error reading file: {str(e)}"

        return {
            "name": os.path.basename(target),
            "rel_path": rel_path,
            "size_bytes": size,
            "is_binary": is_binary,
            "truncated": truncated,
            "content": content
        }

file_service = SafeFileService()
