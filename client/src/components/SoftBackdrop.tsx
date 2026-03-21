export default function SoftBackdrop() {
    return (
        <div className="fixed inset-0 -z-1 pointer-events-none">
            <div className="absolute left-1/2 top-0 h-[420px] w-[980px] -translate-x-1/2 rounded-full bg-linear-to-tr from-blue-300/45 via-sky-200/35 to-transparent blur-3xl" />
            <div className="absolute left-[-8%] top-[24%] h-[260px] w-[260px] rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute right-[4%] top-[18%] h-[240px] w-[240px] rounded-full bg-blue-200/50 blur-3xl" />
            <div className="absolute bottom-[8%] right-[10%] h-[240px] w-[320px] rounded-full bg-sky-100/70 blur-3xl" />
        </div>
    )
}
