import { ArrowRightIcon, PlayIcon, ZapIcon, CheckIcon } from 'lucide-react';
import { PrimaryButton, GhostButton } from './Buttons';
import { motion } from 'framer-motion';

export default function Hero() {

    const trustedUserImages = [
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop'
    ];

    const mainImageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    const galleryStripImages = [
        'https://plus.unsplash.com/premium_photo-1661962229590-dd3986bc984e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'https://plus.unsplash.com/premium_photo-1682430234967-b9f3386975ca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHBlb3BsZSUyMHdvcmtpbmd8ZW58MHx8MHx8fDA%3D',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlJTIwd29ya2luZ3xlbnwwfHwwfHx8MA%3D%3D',
    ];

    const trustedLogosText = [
        'Adobe',
        'Figma',
        'Canva',
        'Shopify',
        'Webflow'
    ];

    return (
        <>
            <section id="home" className="relative z-10">
                <div className="max-w-6xl mx-auto px-4 min-h-screen max-md:w-screen max-md:overflow-hidden pt-32 md:pt-26 flex items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="text-left">
                            <motion.a href="https://prebuiltui.com/tailwind-templates?ref=pixel-forge" className="mb-6 inline-flex items-center justify-start gap-3 rounded-full border border-blue-100 bg-white/90 pl-3 pr-4 py-1.5 shadow-sm"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
                            >
                                <div className="flex -space-x-2">
                                    {trustedUserImages.map((src, i) => (
                                        <img
                                            key={i}
                                            src={src}
                                            alt={`Client ${i + 1}`}
                                            className="size-6 rounded-full border border-white shadow-sm"
                                            width={40}
                                            height={40}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-600">
                                    Trusted by 10,000+ creators
                                </span>
                            </motion.a>

                            <motion.h1 className="mb-6 max-w-xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 }}
                            >
                                Create viral UGC <br />
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-700 via-sky-600 to-cyan-500">
                                    in seconds.
                                </span>
                            </motion.h1>

                            <motion.p className="mb-8 max-w-lg text-slate-600"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.2 }}
                            >
                                Upload product images and a model photo. Our AI
                                instantly produces professional lifestyle imagery
                                and short-form videos optimized for commercials and
                                Reels.
                            </motion.p>

                            <motion.div className="mb-8 flex flex-col items-center gap-4 sm:flex-row"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.3 }}
                            >
                                <a href="/" className="w-full sm:w-auto">
                                    <PrimaryButton className="max-sm:w-full px-7 py-3">
                                        Start generating - it's free
                                        <ArrowRightIcon className="size-4" />
                                    </PrimaryButton>
                                </a>

                                <GhostButton className="max-sm:w-full max-sm:justify-center px-5 py-3">
                                    <PlayIcon className="size-4" />
                                    Watch demo
                                </GhostButton>
                            </motion.div>

                            <motion.div className="surface-panel flex overflow-hidden rounded-2xl text-sm max-sm:justify-center sm:inline-flex"
                                initial={{ y: 60, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 }}
                            >
                                <div className="flex items-center gap-2 p-2 px-3 text-slate-700 transition-colors hover:bg-blue-50 sm:px-6.5">
                                    <ZapIcon className="size-4 text-blue-600" />
                                    <div>
                                        <div>seconds to create</div>
                                        <div className="text-xs text-slate-500">
                                            optimized social formats
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden h-6 w-px bg-slate-200 sm:block" />

                                <div className="flex items-center gap-2 p-2 px-3 text-slate-700 transition-colors hover:bg-blue-50 sm:px-6.5">
                                    <CheckIcon className="size-4 text-cyan-600" />
                                    <div>
                                        <div>commercial rights</div>
                                        <div className="text-xs text-slate-500">
                                            Use anywhere, no fuss
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div className="mx-auto w-full max-w-lg"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.5 }}
                        >
                            <motion.div className="surface-panel overflow-hidden rounded-[2rem] p-3">
                                <div className="relative aspect-16/10 overflow-hidden rounded-[1.4rem] bg-slate-100">
                                    <img
                                        src={mainImageUrl}
                                        alt="agency-work-preview"
                                        className="w-full h-full object-cover object-center"
                                    />

                                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-slate-700 shadow-sm backdrop-blur-sm">
                                        Social-ready / 9:16 & 16:9
                                    </div>

                                    <div className="absolute right-4 bottom-4">
                                        <button className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-slate-700 shadow-sm transition hover:bg-blue-50 focus:outline-none">
                                            <PlayIcon className="size-4 text-blue-600" />
                                            <span className="text-xs font-medium">Preview</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="mt-4 flex items-center justify-start gap-3">
                                {galleryStripImages.map((src, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.1 + i * 0.1 }}
                                        className="h-10 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                    >
                                        <img
                                            src={src}
                                            alt="project-thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                                <motion.div className="ml-2 flex items-center gap-2 text-sm text-slate-500"
                                    initial={{ y: 60, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.2 }}
                                >
                                    <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping duration-300" />

                                        <span className="relative inline-flex size-2 rounded-full bg-green-600" />
                                    </div>
                                    +20 more
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <motion.section className="max-md:mt-10 border-y border-slate-200/80 bg-white/65 backdrop-blur-sm"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="w-full overflow-hidden py-6">
                        <div className="flex gap-14 items-center justify-center animate-marquee whitespace-nowrap">
                            {trustedLogosText.concat(trustedLogosText).map((logo, i) => (
                                <span
                                    key={i}
                                    className="mx-6 text-sm font-semibold tracking-wide text-slate-400 transition-colors hover:text-blue-700 md:text-base"
                                >
                                    {logo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>
        </>
    );
};
