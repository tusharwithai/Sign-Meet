"use client";

import React, { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, MoreVertical, MonitorUp, Sun, Moon } from "lucide-react";
import { useMeetStore } from "@/store/useMeetStore";
import { useTheme } from "next-themes";

export default function LobbyPage({ params }: { params: Promise<{ roomId: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { isMicEnabled, isCamEnabled, toggleMic: toggleStoreMic, toggleCam: toggleStoreCam } = useMeetStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setErrorDesc("Media devices not supported in this browser.");
          return;
        }
        
        const constraints = {
          video: isCamEnabled ? { facingMode: "user" } : false,
          audio: isMicEnabled,
        };

        if (!constraints.video && !constraints.audio) {
          if (videoRef.current) videoRef.current.srcObject = null;
          return;
        }

        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(activeStream);
        
        if (videoRef.current && isCamEnabled) {
          videoRef.current.srcObject = activeStream;
        }
        setErrorDesc(null);
      } catch (err: unknown) {
        console.error("Error accessing media:", err);
        setErrorDesc("Cannot access camera or microphone. Please check permissions.");
      }
    };

    startMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCamEnabled, isMicEnabled]);

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !isMicEnabled);
    }
    toggleStoreMic();
  };

  const toggleCam = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !isCamEnabled);
    }
    toggleStoreCam();
  };

  const handleJoin = () => {
    router.push(`/${roomId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">
      {/* Lobby Header */}
      <header className="p-4 px-6 flex items-center justify-between">
        <div className="text-xl font-medium tracking-tight">Google Meet</div>
        <div className="flex items-center gap-4">
          <button
              suppressHydrationWarning
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center hover:bg-surface rounded-full transition-colors text-muted hover:text-foreground"
              aria-label="Toggle Dark Mode"
            >
              {resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
        </div>
      </header>
      
      {/* Lobby Body */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 max-w-6xl mx-auto w-full">
        {/* Left Side: Video Preview */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full aspect-video md:max-w-[700px] bg-surface rounded-lg overflow-hidden shadow-lg border border-border mt-4 md:mt-0">
          
          {errorDesc ? (
            <div className="flex items-center justify-center w-full h-full text-center p-4">
              <p className="text-foreground text-lg">{errorDesc}</p>
            </div>
          ) : isCamEnabled ? (
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted // Always muted in lobby to prevent feedback
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl mb-6 shadow-md">
                T
              </div>
              <p className="absolute bottom-6 text-white bg-black/60 px-3 py-1.5 rounded-md text-sm backdrop-blur-sm tracking-wide">
                Camera is off
              </p>
            </div>
          )}
          
          {/* Controls overlay */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full transition-colors ${isMicEnabled ? 'bg-surface hover:bg-surface-hover text-foreground' : 'bg-danger text-white'}`}
            >
              {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleCam}
              className={`p-4 rounded-full transition-colors ${isCamEnabled ? 'bg-surface hover:bg-surface-hover text-foreground' : 'bg-danger text-white'}`}
            >
              {isCamEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <div className="w-px h-10 bg-border self-center mx-2 hidden md:block" />
            <button className="p-4 rounded-full bg-surface/80 hover:bg-surface text-foreground border border-border backdrop-blur-md transition-colors shadow-lg">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Side: Join Options */}
        <div className="w-full max-w-[400px] flex flex-col items-center text-center p-4 md:p-8 animate-fade-in">
          <h2 className="text-3xl font-normal mb-8 text-foreground">Ready to join?</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button 
              onClick={handleJoin}
              className="bg-primary hover:bg-primary-hover text-white dark:text-gray-900 font-medium px-8 py-3 rounded-full flex-1 w-full flex items-center justify-center transition-colors shadow-sm"
            >
              Join now
            </button>
            <button className="bg-transparent hover:bg-primary/10 text-primary font-medium px-8 py-3 rounded-full flex-1 w-full border border-border hover:border-primary/50 flex items-center justify-center gap-2 transition-colors">
              <MonitorUp className="w-5 h-5" />
              Present
            </button>
          </div>
          
          <p className="mt-8 text-sm text-muted">
            Other options
          </p>
          <button className="mt-4 text-primary hover:bg-primary/10 p-2 rounded transition-colors text-sm font-medium">
            Join and use a phone for audio
          </button>
        </div>
      </main>
    </div>
  );
}
