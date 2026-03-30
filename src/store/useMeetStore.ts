import { create } from 'zustand';

interface MeetStore {
  isMicEnabled: boolean;
  isCamEnabled: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isCaptionsEnabled: boolean;
  isHandRaised: boolean;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleChat: () => void;
  toggleParticipants: () => void;
  toggleCaptions: () => void;
  toggleHandRaise: () => void;
  closeAllPanels: () => void;
}

export const useMeetStore = create<MeetStore>((set) => ({
  isMicEnabled: false,
  isCamEnabled: true,
  isChatOpen: false,
  isParticipantsOpen: false,
  isCaptionsEnabled: false,
  isHandRaised: false,
  toggleMic: () => set((state) => ({ isMicEnabled: !state.isMicEnabled })),
  toggleCam: () => set((state) => ({ isCamEnabled: !state.isCamEnabled })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen, isParticipantsOpen: false })),
  toggleParticipants: () => set((state) => ({ isParticipantsOpen: !state.isParticipantsOpen, isChatOpen: false })),
  toggleCaptions: () => set((state) => ({ isCaptionsEnabled: !state.isCaptionsEnabled })),
  toggleHandRaise: () => set((state) => ({ isHandRaised: !state.isHandRaised })),
  closeAllPanels: () => set({ isChatOpen: false, isParticipantsOpen: false }),
}));
