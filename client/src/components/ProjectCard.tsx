import type { Project } from "../Types"
import { EllipsisIcon, ImageIcon, Loader2Icon, PlaySquareIcon, Share2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { GhostButton, PrimaryButton } from "./Buttons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import api from "../configs/axios";
import toast from "react-hot-toast";

const ProjectCard = ({gen, setGenerations: _setGenerations, forCommunity = false} : {gen: Project, setGenerations: React.Dispatch<React.SetStateAction<Project[]>>, forCommunity?: boolean}) => {
    const [menuOpen, setMenuOpen ] = useState(false)
    const navigate = useNavigate();
    const { getToken } = useAuth();
    
    const handleDelete = async (id: string) =>{
        const confirm = window.confirm('Are you sure you want to delete this project?');
        if(!confirm) return;

        try {
            const token = await getToken();
            await api.delete(`/api/project/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            _setGenerations((generations) => generations.filter((project) => project.id !== id));
            toast.success("Project deleted successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const togglePublish = async (id: string) => {
        try {
            const token = await getToken();
            const { data } = await api.get(`/api/user/publish/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            _setGenerations((generations) =>
                generations.map((project) =>
                    project.id === id ? { ...project, isPublished: data.isPublished } : project
                )
            );
            toast.success(data.isPublished ? "Project published" : "Project unpublished");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleShare = async () => {
        const url = gen.generatedVideo || gen.generatedImage;

        if (!url) {
            return;
        }

        if (!navigator.share) {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
            return;
        }

        try {
            await navigator.share({
                url,
                title: gen.productName,
                text: gen.productDescription
            });
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                toast.error(error.message);
            }
        }
    };

  return (
    <div key={gen.id} className="mb-4 break-inside-avoid">
        <div className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.18)] transition hover:border-blue-200">
        {/*preview */}
           <div className={`${gen?.aspectRatio === '9:16' ? 'aspect-9/16' : 'aspect-video'} relative overflow-hidden`}>
            {gen.generatedImage && ( <img src={gen.generatedImage} alt={gen.productName} className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${gen.generatedVideo ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} />)}
            {gen.generatedVideo && <video src={gen.generatedVideo} muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500" onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />}
            {(!gen?.generatedImage && !gen?.generatedVideo) && ( <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-100"> <Loader2Icon className="size-7 animate-spin text-blue-600" /></div>)}

        {/*status badges */}
             <div className="absolute left-3 top-3 flex gap-2 items-center">
                {gen.isGenerating && (<span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">Generating</span>)}
                {gen.isPublished && (<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Published</span>)}

             </div>

        {/* action menu for my generations only */}
        {!forCommunity && (
            <div
            onMouseDownCapture={()=>{setMenuOpen(true)}}
            onMouseLeave={()=>{setMenuOpen(false)}}
             className="absolute right-3 top-3 sm:opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
               <div className="absolute top-3 right-3">
                 <EllipsisIcon className="ml-auto size-7 rounded-full border border-white/70 bg-white/90 p-1 text-slate-700 shadow-sm" />
               </div>
               <div className="flex flex-col items-end w-32 text-sm">
                <ul className={`text-xs ${menuOpen ? 'block' : 'hidden'} overflow-hidden right-0 peer-focus:block hover:block w-40 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xl mt-2 py-1 z-10`}>
                   
                   { gen.generatedImage && <a href={gen.generatedImage} download className="flex gap-2 items-center px-4 py-2 hover:bg-slate-50 cursor-pointer">
                        <ImageIcon size={14} /> Download Image
                    </a>
                   }

                    { gen.generatedVideo && <a href={gen.generatedVideo} download className="flex gap-2 items-center px-4 py-2 hover:bg-slate-50 cursor-pointer">
                        <PlaySquareIcon size={14} /> Download Video
                    </a>
                   }

                    { (gen.generatedVideo || gen.generatedImage) && <button
                    onClick={handleShare}
                    className="w-full flex gap-2 items-center px-4 py-2 hover:bg-slate-50 cursor-pointer">
                        <Share2Icon size={14} /> Share 
                    </button>
                   }

                   <button onClick={()=> handleDelete(gen.id)}
                   className="w-full flex gap-2 items-center px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer">
                    <Trash2Icon />
                    Delete
                   </button>
                </ul>

               </div>
            </div>
        )

        }
        {/* source images */}
            <div className="absolute right-3 bottom-3">
                <img src={gen.uploadedImages[0]} alt="product" className="w-16 h-16 object-cover rounded-full animate-float" />
                <img src={gen.uploadedImages[1]} alt="product" className="w-16 h-16 object-cover rounded-full animate-float -ml-8" style={{animationDelay: '3s'}} />
            </div>

           </div>

        {/* details */}
        <div className="p-4">
        {/* product name, date, aspect ration */}
           <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate text-lg font-medium text-slate-900">{gen.productName}</h3>
                    <p className="whitespace-nowrap text-sm text-slate-500">Created: {new Date(gen.createdAt).toLocaleString()}</p>
                    {gen.updatedAt && ( <p className="mt-1 whitespace-nowrap text-xs text-slate-400">Updated: {new Date(gen.updatedAt).toLocaleString()}</p>)}
                </div>
                <div className="shrink-0">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-blue-100">Aspect: {gen.aspectRatio}</span>
                </div>
           </div>
           {/* product description */}
           {gen.productDescription && ( 
                <div className="mt-3">
                <p className="text-xs text-slate-400 mb-1">Description</p>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl break-words">{gen.productDescription}</div>
            </div>)}
           {/* user prompt */}
           {gen.userPrompt && ( 
                <div className="mt-3">
                <div className="text-sm text-slate-600 rounded-2xl border border-slate-200 bg-white p-3">{gen.userPrompt}</div>
            </div>)}

            {/* buttons */}
            {!forCommunity && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                   <GhostButton className="text-xs justify-center" onClick={()=> {navigate(`/result/${gen.id}`); scrollTo(0, 0)}}>
                     View Details
                   </GhostButton>
                   <PrimaryButton onClick={()=> togglePublish(gen.id)} className="rounded-md">
                       {gen.isPublished ? 'Unpublished' : 'Publish'}
                   </PrimaryButton>
                </div>
            )}
        </div>
        </div>

    </div>
  )
}

export default ProjectCard
