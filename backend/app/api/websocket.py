import asyncio
import json
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import settings
from app.services.telemetry import telemetry_collector
from app.services.health_checker import health_checker
from app.services.docker_service import docker_service

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send immediate initial state
        summary = telemetry_collector.get_system_summary()
        initial_payload = {
            "type": "initial",
            "summary": summary.model_dump(),
            "history": [p.model_dump() for p in telemetry_collector.get_history()]
        }
        await websocket.send_text(json.dumps(initial_payload))

        while True:
            # Sleep sampling interval
            await asyncio.sleep(settings.SAMPLING_INTERVAL_SECONDS)
            
            # Read latest metrics
            summary = telemetry_collector.get_system_summary()
            history = telemetry_collector.get_history()
            
            payload = {
                "type": "tick",
                "summary": summary.model_dump(),
                "latest_point": history[-1].model_dump() if history else None
            }
            await websocket.send_text(json.dumps(payload))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
