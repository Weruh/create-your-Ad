import { DollarSignIcon, FolderEditIcon, GalleryHorizontalEnd, MenuIcon, SparkleIcon, XIcon } from 'lucide-react';
import { GhostButton, PrimaryButton } from './Buttons';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useClerk, useUser, UserButton, useAuth } from '@clerk/react';
import api from '../configs/axios';

export default function Navbar() {
    const CREDITS_REFRESH_EVENT = 'credits:refresh';

    const navigate = useNavigate()
    const { user } = useUser()
    const { openSignIn, openSignUp } = useClerk()
    const [isOpen, setIsOpen] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const { pathname } = useLocation();
    const { getToken } = useAuth()

    const navLinks = [
        { name: 'Home', href: '/#' },
        { name: 'Create', href: '/generate' },
        { name: 'Community', href: '/community' },
        { name: 'Plans', href: '/plans' },
    ];

    useEffect(() => {
        if (!user) {
            setCredits(null);
            return;
        }

        let isMounted = true;

        const loadUserCredits = async () => {
            try {
                const token = await getToken()
                const { data } = await api.get('/api/user/credits', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (isMounted) {
                    setCredits(data.credits)
                }
            } catch (error: unknown) {
                if (isMounted) {
                    setCredits(null)
                }

                console.error('Failed to load credits', error);
            }
        };

        const handleCreditsRefresh = () => {
            void loadUserCredits();
        };

        void loadUserCredits();
        window.addEventListener(CREDITS_REFRESH_EVENT, handleCreditsRefresh);

        return () => {
            isMounted = false;
            window.removeEventListener(CREDITS_REFRESH_EVENT, handleCreditsRefresh);
        };
    }, [getToken, pathname, user])

    return (
        <motion.nav className='fixed top-5 left-0 right-0 z-50 px-4'
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
        >
            <div className='surface-panel max-w-6xl mx-auto flex items-center justify-between rounded-2xl p-3'>
                <Link to='/' onClick={() => scrollTo(0, 0)}>
                    <img src={assets.logo} alt="logo" className="h-8" />
                </Link>

                <div className='hidden md:flex items-center gap-8 text-sm font-medium text-slate-600'>
                    {navLinks.map((link) => (
                        <Link onClick={() => scrollTo(0, 0)} to={link.href} key={link.name} className="hover:text-blue-700 transition">
                            {link.name}
                        </Link>
                    ))}
                </div>

                {!user ? (
                    <div className='hidden md:flex items-center gap-3'>
                        <button onClick={() => openSignIn()} className='text-sm font-medium text-slate-600 hover:text-blue-700 transition max-sm:hidden'>
                            Sign in
                        </button>
                        <PrimaryButton onClick={() => openSignUp()} className='max-sm:text-xs hidden sm:inline-block'>Get Started</PrimaryButton>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <GhostButton onClick={() => navigate('/plans')} className='border-slate-200 text-slate-700 sm:py-1'>
                            Credits: {credits ?? '--'}
                        </GhostButton>
                        <UserButton>
                            <UserButton.MenuItems>
                                <UserButton.Action label='Generate' labelIcon={<SparkleIcon size={14} />} onClick={() => navigate('/generate')} />
                                <UserButton.Action label='My Generations' labelIcon={<FolderEditIcon size={14} />} onClick={() => navigate('/my-generations')} />
                                <UserButton.Action label='Community' labelIcon={<GalleryHorizontalEnd size={14} />} onClick={() => navigate('/community')} />
                                <UserButton.Action label='Plans' labelIcon={<DollarSignIcon size={14} />} onClick={() => navigate('/plans')} />
                            </UserButton.MenuItems>
                        </UserButton>
                    </div>
                )}

                {!user && <button onClick={() => setIsOpen(!isOpen)} className='md:hidden rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm'>
                    <MenuIcon className='size-5' />
                </button>}



            </div>
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/90 text-lg font-medium text-slate-800 backdrop-blur-xl transition-all duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                {navLinks.map((link) => (
                    <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="hover:text-blue-700">
                        {link.name}
                    </a>
                ))}

                <button onClick={() => { setIsOpen(false); openSignIn() }} className='font-medium text-slate-600 hover:text-blue-700 transition'>
                    Sign in
                </button>
                <PrimaryButton onClick={() => { setIsOpen(false); openSignUp() }}>Get Started</PrimaryButton>

                <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm ring-blue-200 active:ring-2"
                >
                    <XIcon />
                </button>
            </div>
        </motion.nav>
    );
};
