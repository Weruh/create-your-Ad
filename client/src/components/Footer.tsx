import { assets } from '../assets/assets';
import { footerLinks } from '../assets/dummy-data';
import { motion } from 'framer-motion';

export default function Footer() {

    return (
        <motion.footer className="bg-white/75 border-t border-slate-200/80 pt-10 text-slate-600 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.5 }}
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col items-start justify-between gap-10 border-b border-slate-200 py-10 md:flex-row">
                    <div>
                        <img src={assets.logo} alt="logo" className="h-8" />
                        <p className="mt-6 max-w-[410px] text-sm leading-relaxed text-slate-500">
                            Create viral UGC in seconds. Upload product images and a model photo and let the platform produce polished lifestyle imagery and short-form videos.
                        </p>
                    </div>

                    <div className="flex w-full flex-wrap justify-between gap-5 md:w-[45%]">
                        {footerLinks.map((section, index) => (
                            <div key={index}>
                                <h3 className="mb-2 text-base font-semibold text-slate-900 md:mb-5">
                                    {section.title}
                                </h3>
                                <ul className="space-y-1 text-sm">
                                    {section.links.map(
                                        (link: { name: string; url: string }, i) => (
                                            <li key={i}>
                                                <a
                                                    href={link.url}
                                                    className="transition hover:text-blue-700"
                                                >
                                                    {link.name}
                                                </a>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="py-4 text-center text-sm text-slate-400">
                    Copyright {new Date().getFullYear()} Weru.io. All rights reserved.
                </p>
            </div>
        </motion.footer>
    );
};
