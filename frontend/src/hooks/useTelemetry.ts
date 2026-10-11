import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemSummary, HistoricalPoint } from '../types/telemetry';
import { fetchSystemSummary, fetchHistory } from '../services/api';

export function useTelemetry() {
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [history, setHistory] = useState<HistoricalPoint[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const fallbackPoll = useCallback(async () => {
    try {
      const [sumData, histData] = await Promise.all([
        fetchSystemSummary(),
        fetchHistory(60),
      ]);
      setSummary(sumData);
      setHistory(histData);
      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to poll telemetry');
      setIsConnected(false);
    }
  }, []);

  const connectWs = useCallback(() => {
    // Determine ws url
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/telemetry`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'initial') {
            setSummary(data.summary);
            if (data.history) {
              setHistory(data.history);
            }
          } else if (data.type === 'tick') {
            setSummary(data.summary);
            if (data.latest_point) {
              setHistory((prev) => {
                const next = [...prev, data.latest_point];
                // Keep bounded at last 60 points
                return next.slice(-60);
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse websocket message', e);
        }
      };

      ws.onerror = () => {
        // Fall back to REST polling if WS fails
        fallbackPoll();
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWs();
        }, 3000);
      };
    } catch (e) {
      fallbackPoll();
    }
  }, [fallbackPoll]);

  useEffect(() => {
    // Initial fetch to get immediate data without waiting
    fallbackPoll();
    connectWs();

    // Fallback polling interval every 4 seconds in case WS is dropped
    const pollInterval = window.setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fallbackPoll();
      }
    }, 4000);

    return () => {
      window.clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWs, fallbackPoll]);

  return { summary, history, isConnected, error, refresh: fallbackPoll };
}
