import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../components/auth/useAuthStore"; // 추가

export default function useAuctionSocket(unveilingNo, onBidUpdate) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const token = useAuthStore((s) => s.token); // 추가

  useEffect(() => {
    if (!unveilingNo) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_URL}/ws`),

      // 추가 — 토큰 있으면 헤더로 전달 (비로그인도 구독은 가능)
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},

      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/auction/${unveilingNo}`, (message) => {
          const data = JSON.parse(message.body);
          onBidUpdate?.(data);
        });
      },

      onDisconnect: () => setConnected(false),

      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [unveilingNo, token]); // token 의존성 추가

  return { connected };
}