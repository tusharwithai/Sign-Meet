"use client";

import React, { useEffect, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, MonitorUp, SmilePlus, Captions, Info, Users, Copy, Check, Hand, MoreVertical, Lock, ChevronUp } from "lucide-react";
import { useMeetStore } from "@/store/useMeetStore";

const REACTIONS = ["👍", "👎", "👏", "😂", "😮", "😢", "🎉"];

export default function MeetingControls() {
  const { localParticipant } = useLocalParticipant();
  const { isChatOpen, toggleChat, isParticipantsOpen, toggleParticipants, isCaptionsEnabled, toggleCaptions, isHandRaised, toggleHandRaise } = useMeetStore();
  const [time, setTime] = useState("");
  
  // Modals state
  const [showInfo, setShowInfo] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMic = () => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    }
  };

  const toggleCam = () => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
    }
  };

  const toggleShare = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
      } catch (err) {
        console.error("Screen sharing cancelled", err);
      }
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendReaction = (emoji: string) => {
    setShowReactions(false);
    // TODO: Broadcast overlay implementation
  };

  const isMicOn = localParticipant?.isMicrophoneEnabled ?? false;
  const isCamOn = localParticipant?.isCameraEnabled ?? false;
  const isSharing = localParticipant?.isScreenShareEnabled ?? false;

  return (
    <div className="flex items-center justify-between px-6 bg-[#202124] text-white z-20 absolute bottom-0 left-0 right-0 h-20">
      
      {/* Left Info */}
      <div className="flex w-1/4 items-center gap-2">
        <span className="text-sm font-medium">{time}</span>
        <span className="text-white/50">|</span>
        <span className="text-sm font-medium truncate">{typeof window !== 'undefined' ? window.location.pathname.substring(1) : 'Room'}</span>
      </div>

      {/* Center Actions */}
      <div className="flex items-center justify-center gap-2 w-2/4">
        {/* Mic Group */}
        <div className="flex items-center bg-[#3c4043] rounded-full mr-1 overflow-hidden transition-colors">
          <button 
            onClick={toggleMic}
            title="Turn on microphone"
            className={`px-4 py-3 hover:bg-[#4d5156] transition-colors ${!isMicOn ? 'bg-[#ea4335] hover:bg-[#d32f2f]' : ''}`}
          >
            {isMicOn ? <Mic className="w-5 h-5 fill-current" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button className="px-2 border-l border-white/20 hover:bg-[#4d5156] transition-colors h-full flex items-center">
             <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Cam Group */}
        <div className="flex items-center bg-[#3c4043] rounded-full mr-1 overflow-hidden transition-colors">
          <button 
            onClick={toggleCam}
            title="Turn on camera"
            className={`px-4 py-3 hover:bg-[#4d5156] transition-colors ${!isCamOn ? 'bg-[#ea4335] hover:bg-[#d32f2f]' : ''}`}
          >
            {isCamOn ? <Video className="w-5 h-5 fill-current" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button className="px-2 border-l border-white/20 hover:bg-[#4d5156] transition-colors h-full flex items-center">
             <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={toggleCaptions}
          title="Turn on captions" 
          className={`p-3 rounded-full transition-colors ${isCaptionsEnabled ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4d5156]'}`}
        >
          <Captions className={`w-5 h-5 ${isCaptionsEnabled ? 'fill-current' : ''}`} />
        </button>

        {/* Reactions Wrapper */}
        <div className="relative">
          <button 
            onClick={() => setShowReactions(!showReactions)}
            title="Send a reaction" 
            className={`p-3 rounded-full transition-colors ${showReactions ? 'bg-[#4d5156]' : 'bg-[#3c4043] hover:bg-[#4d5156]'}`}
          >
            <SmilePlus className="w-5 h-5" />
          </button>
          
          {showReactions && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#3c4043] border border-white/10 rounded-full flex items-center p-2 shadow-2xl gap-2 animate-in fade-in slide-in-from-bottom-2">
              {REACTIONS.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="w-10 h-10 hover:bg-[#4d5156] rounded-full text-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={toggleShare}
          title={isSharing ? "Stop presenting" : "Present now"} 
          className={`p-3 rounded-full transition-colors ${isSharing ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4d5156]'}`}
        >
          <MonitorUp className="w-5 h-5" />
        </button>

        <button 
          onClick={toggleHandRaise}
          title={isHandRaised ? "Lower hand" : "Raise hand"} 
          className={`p-3 rounded-full transition-colors ${isHandRaised ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4d5156]'}`}
        >
          <Hand className={`w-5 h-5 ${isHandRaised ? 'fill-current' : ''}`} />
        </button>

        <button 
          title="More options" 
          className={`p-3 rounded-full transition-colors bg-[#3c4043] hover:bg-[#4d5156] mx-1`}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        <button 
          onClick={() => window.location.href = '/'}
          title="Leave call"
          className="p-3 px-6 bg-[#ea4335] hover:bg-[#d32f2f] text-white rounded-full transition-colors shadow-lg"
        >
          <Phone className="w-5 h-5 transform rotate-[135deg] fill-current" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-end w-1/4 gap-1">
        {/* Info Wrapper */}
        <div className="relative">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            title="Meeting details"
            className={`p-3 rounded-full transition-colors ${showInfo ? 'bg-[#4d5156] text-[#8ab4f8]' : 'hover:bg-[#3c4043] text-white'}`}
          >
            <Info className="w-5 h-5" />
          </button>
          
          {showInfo && (
            <div className="absolute bottom-16 right-0 w-80 bg-[#ffffff] text-[#202124] dark:bg-[#202124] dark:text-white border border-border shadow-2xl rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-medium text-lg mb-2">Joining info</h3>
              <p className="text-sm mb-4 break-all opacity-80">{window.location.href}</p>
              <button 
                onClick={copyUrl}
                className="w-full bg-[#e8f0fe] hover:bg-[#d2e3fc] dark:bg-[#8ab4f8]/10 dark:hover:bg-[#8ab4f8]/20 text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link copied" : "Copy joining info"}
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={toggleParticipants}
          title="Show everyone"
          className={`p-3 rounded-full transition-colors ${isParticipantsOpen ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]' : 'hover:bg-[#3c4043] text-white'}`}
        >
           <Users className="w-5 h-5" />
        </button>

        <button 
          onClick={toggleChat}
          title="Chat with everyone"
          className={`p-3 rounded-full transition-colors ${isChatOpen ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]' : 'hover:bg-[#3c4043] text-white'}`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button 
          title="Host controls"
          className={`p-3 rounded-full transition-colors hover:bg-[#3c4043] text-white`}
        >
          <Lock className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
