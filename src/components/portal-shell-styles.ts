/** Disposition commune au portail et à son chargement initial. */
export const portalShellStyles = {
  frame: "min-h-screen bg-[#fbf8f7] text-slate-950",
  sidebar: "fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-hidden bg-[linear-gradient(180deg,#4a0710_0%,#710d17_58%,#98131d_100%)] px-4 py-5 text-red-50 shadow-[18px_0_45px_rgba(94,10,19,.12)] lg:flex",
  body: "min-h-screen pb-20 lg:ml-[248px] lg:pb-0",
  header: "sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl lg:h-[72px] lg:px-10",
  content: "mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8",
};
