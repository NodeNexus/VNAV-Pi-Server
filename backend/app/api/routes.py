from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Header, Body
from pydantic import BaseModel

from app.core.config import settings
from app.schemas.telemetry import (
    SystemSummary,
    CpuMetrics,
    NetworkMetrics,
    DiskMetrics,
    ServiceItem,
    ContainerItem,
    LogItem,
    HistoricalPoint
)
from app.services.telemetry import telemetry_collector
from app.services.health_checker import health_checker
from app.services.docker_service import docker_service
from app.services.logs_service import logs_service
from app.services.file_service import file_service
from app.services.terminal_service import terminal_service

router = APIRouter()

class ServiceUrlUpdate(BaseModel):
    url: str

class ContainerActionRequest(BaseModel):
    action: str  # start, stop, restart
    api_key: Optional[str] = None

class TerminalExecRequest(BaseModel):
    command_alias: Optional[str] = None
    custom_command: Optional[str] = None
    api_key: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    sampling_interval: Optional[float] = None
    simulation_mode: Optional[bool] = None

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "hostname": settings.HOSTNAME,
        "target_device": "Raspberry Pi 5"
    }

@router.get("/system/summary", response_model=SystemSummary)
def get_system_summary():
    summary = telemetry_collector.get_system_summary()
    # Update service and container counts
    services = health_checker.get_all_services()
    containers = docker_service.list_containers()
    summary.services_online = len([s for s in services if s.status == "running"])
    summary.services_total = len(services)
    summary.containers_running = len([c for c in containers if c.state == "running"])
    summary.containers_total = len(containers)
    return summary

@router.get("/system/metrics", response_model=CpuMetrics)
def get_cpu_metrics():
    return telemetry_collector.get_cpu_metrics()

@router.get("/network/metrics", response_model=NetworkMetrics)
def get_network_metrics():
    net, _, _ = telemetry_collector.get_network_metrics()
    return net

@router.get("/storage", response_model=DiskMetrics)
def get_storage_metrics():
    disk, _, _ = telemetry_collector.get_disk_metrics()
    return disk

@router.get("/history", response_model=List[HistoricalPoint])
def get_history(limit: int = Query(120, ge=10, le=500)):
    points = telemetry_collector.get_history()
    return points[-limit:]

@router.get("/services", response_model=List[ServiceItem])
def get_services():
    return health_checker.get_all_services()

@router.post("/services/{service_id}/url")
def update_service_url(service_id: str, payload: ServiceUrlUpdate):
    health_checker.update_service_url(service_id, payload.url)
    return {"success": True, "message": f"Updated URL for {service_id}"}

@router.get("/containers", response_model=List[ContainerItem])
def get_containers():
    return docker_service.list_containers()

@router.post("/containers/{container_id}/action")
def perform_container_action(
    container_id: str,
    payload: ContainerActionRequest,
    x_api_key: Optional[str] = Header(None)
):
    # Verify auth
    auth_key = payload.api_key or x_api_key
    if auth_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key or unauthorized container control")

    action = payload.action.lower()
    if action == "restart":
        res = docker_service.restart_container(container_id)
        logs_service.add_log("INFO", "docker", f"User restarted container {container_id}")
        return res
    elif action == "stop":
        res = docker_service.stop_container(container_id)
        logs_service.add_log("WARN", "docker", f"User stopped container {container_id}")
        return res
    elif action == "start":
        res = docker_service.start_container(container_id)
        logs_service.add_log("INFO", "docker", f"User started container {container_id}")
        return res
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {action}")

@router.get("/logs", response_model=List[LogItem])
def get_logs(
    limit: int = Query(50, ge=1, le=200),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    source: Optional[str] = Query(None)
):
    return logs_service.get_logs(limit=limit, severity=severity, search=search, source=source)

@router.post("/terminal/run")
def run_terminal_command(
    payload: TerminalExecRequest,
    x_api_key: Optional[str] = Header(None)
):
    auth_key = payload.api_key or x_api_key
    if auth_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Authentication required for terminal execution")

    result = terminal_service.execute_command(
        cmd_alias=payload.command_alias or "",
        custom_cmd=payload.custom_command
    )
    logs_service.add_log("INFO", "terminal", f"Executed command: {payload.command_alias or payload.custom_command}")
    return result

@router.get("/files/list")
def list_files(path: str = Query("")):
    try:
        return file_service.list_directory(path)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/files/preview")
def preview_file(path: str = Query(...)):
    try:
        return file_service.read_file_preview(path)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/settings")
def get_settings():
    return {
        "hostname": settings.HOSTNAME,
        "sampling_interval": settings.SAMPLING_INTERVAL_SECONDS,
        "history_buffer_size": settings.RING_BUFFER_SIZE,
        "simulation_mode": health_checker.dev_simulation_mode,
        "os_target": "Raspberry Pi 5 (ARM64)",
        "allowed_root_path": settings.ALLOWED_ROOT_PATH
    }

@router.post("/settings")
def update_settings(payload: SettingsUpdateRequest):
    if payload.sampling_interval is not None and 0.5 <= payload.sampling_interval <= 10.0:
        settings.SAMPLING_INTERVAL_SECONDS = payload.sampling_interval
    if payload.simulation_mode is not None:
        health_checker.dev_simulation_mode = payload.simulation_mode
    return {
        "success": True,
        "sampling_interval": settings.SAMPLING_INTERVAL_SECONDS,
        "simulation_mode": health_checker.dev_simulation_mode
    }
