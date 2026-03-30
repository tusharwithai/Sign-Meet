"use client";

import React, { useEffect, useState, use } from "react";
import { 
  LiveKitRoom, 
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  useTracks
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { useMeetStore } from "@/store/useMeetStore";
import MeetingControls from "@/components/MeetingControls";
import ChatPanel from "@/components/ChatPanel";
import ParticipantsPanel from "@/components/ParticipantsPanel";

function MyVideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  // 1 Person: Centered and capped width
  if (tracks.length === 1) {
    return (
      <div className="w-full h-full p-4 flex items-center justify-center">
        <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden bg-[#3c4043] shadow-md border border-white/5">
          <ParticipantTile trackRef={tracks[0]} className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  // 2 Tracks -> typical 1-on-1 if one is local and one is remote
  if (tracks.length === 2 && tracks.some(t => t.participant.isLocal) && tracks.some(t => !t.participant.isLocal)) {
    const localTrack = tracks.find(t => t.participant.isLocal);
    const remoteTrack = tracks.find(t => !t.participant.isLocal);
    
    return (
      <div className="w-full h-full relative bg-[#202124] p-4 rounded-xl overflow-hidden mt-4 mx-4">
        {/* Focus Remote */}
        {remoteTrack && (
          <div className="absolute inset-0 bg-[#3c4043] rounded-xl overflow-hidden">
            <ParticipantTile trackRef={remoteTrack} className="w-full h-full" />
          </div>
        )}
        
        {/* PIP Local */}
        {localTrack && (
          <div className="absolute bottom-6 right-6 w-72 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/20 z-10 bg-[#3c4043] transition-all hover:scale-105 cursor-pointer">
             <ParticipantTile trackRef={localTrack} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  // 3+ People: Default grid
  return (
    <div className="w-full h-full p-4">
      <GridLayout tracks={tracks} style={{ height: 'calc(100vh - 120px)' }}>
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}

export default function MeetingRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;
  const [token, setToken] = useState("");
  const { isMicEnabled, isCamEnabled, isChatOpen, isParticipantsOpen } = useMeetStore();
  
  // You would configure this in frontend/.env.local (NEXT_PUBLIC_LIVEKIT_URL)
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://test-project.livekit.cloud";
  const [participantName] = useState(() => `Guest-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch(`http://localhost:3001/getToken?roomName=${roomId}&participantName=${participantName}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
        } else {
          console.error("No token received", data);
        }
      } catch (e) {
        console.error("Failed to fetch token, check backend", e);
      }
    };
    
    getToken();
  }, [roomId, participantName]);

  const isFallbackUrl = serverUrl === "wss://test-project.livekit.cloud";

  if (isFallbackUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
        <div className="w-16 h-16 bg-danger/20 text-danger rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-medium mb-4">LiveKit Not Configured</h1>
        <p className="text-muted max-w-lg mb-8">
          You are seeing the &quot;Disconnected&quot; error because the app is using the dummy fallback URL. To securely connect the video grid, please configure your <strong>.env</strong> files!
        </p>
        <div className="text-left bg-surface p-6 rounded-lg border border-border w-full max-w-2xl font-mono text-sm overflow-x-auto">
          <p className="text-primary mb-2">1. In frontend/.env.local (Create if missing):</p>
          <code className="block text-foreground mb-6">NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud</code>
          
          <p className="text-primary mb-2">2. In backend/.env:</p>
          <code className="block text-foreground">LIVEKIT_API_KEY=your_api_key<br/>LIVEKIT_API_SECRET=your_api_secret</code>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 bg-primary hover:bg-primary-hover text-white dark:text-gray-900 px-6 py-2 rounded-md font-medium transition-colors"
        >
          I have added them, retry
        </button>
      </div>
    );
  }

  if (token === "") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-xl">Joining meeting...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={isCamEnabled}
      audio={isMicEnabled}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden relative"
    >
      <div className="flex-1 flex overflow-hidden w-full h-full pb-20">
        <div className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out`}>
           <MyVideoGrid />
        </div>
        
        {isChatOpen && (
           <div className="w-80 border-l border-border h-full bg-background z-10 flex-shrink-0 animate-in slide-in-from-right-10 duration-200">
              <ChatPanel roomId={roomId} />
           </div>
        )}
        
        {isParticipantsOpen && (
           <div className="w-80 border-l border-border h-full bg-background z-10 flex-shrink-0 animate-in slide-in-from-right-10 duration-200">
              <ParticipantsPanel />
           </div>
        )}
      </div>
      
      <MeetingControls />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
