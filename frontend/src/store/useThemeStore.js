import {create} from 'zustand';

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("MeetNexus-theme") || "coffee",
    setTheme: (theme) => {
        localStorage.setItem("MeetNexus-theme", theme);
        set({theme});
    },
}))