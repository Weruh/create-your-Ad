import { ArrowRightIcon } from 'lucide-react';
import { GhostButton } from './Buttons';
import { motion } from 'framer-motion';

export default function CTA() {
    return (
        <section className="py-20 2xl:pb-32 px-4">
            <div className="container mx-auto max-w-3xl">
                <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-linear-to-br from-white via-blue-50 to-sky-100 p-12 text-center shadow-[0_30px_90px_-45px_rgba(37,99,235,0.45)] md:p-16">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-8" />
                    <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/80 to-transparent" />
                    <div className="relative z-10">
                        <motion.h2 className="text-2xl sm:text-4xl font-semibold mb-6 text-slate-950"
                            initial={{ y: 60, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
                        >
                            Ready to transform your content?
                        </motion.h2>
                        <motion.p className="max-sm:text-sm text-slate-600 mb-10 max-w-xl mx-auto"
                            initial={{ y: 60, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.2 }}
                        >
                            Join thousands of brands creating viral UGC with AI. No credit card required. Start creating now.
                        </motion.p>
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1, delay: 0.3 }}
                        >
                            <GhostButton className="px-8 py-3 gap-2">
                                Start Creating Now <ArrowRightIcon size={20} />
                            </GhostButton>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
