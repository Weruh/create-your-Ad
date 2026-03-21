import { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";
import { Loader2Icon, RectangleHorizontalIcon, RectangleVerticalIcon, Wand2Icon } from "lucide-react";
import { PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../configs/axios";

const aspectRatios = ["9:16", "1:1", "16:9"] as const;
const CREDITS_REFRESH_EVENT = 'credits:refresh';

const Generator = () => {
 
    const { user } = useUser();
    const {getToken} = useAuth();
    const navigate = useNavigate()

    const [name , setName]  = useState("")
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [aspectRatio, setAspectRatio] = useState<(typeof aspectRatios)[number]>("9:16");
    const [productImage, setProductImage] = useState<File | null>(null);
    const [modelImage, setModelImage] = useState<File | null>(null);
    const [userPrompt, setUserPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "product" | "model"
    ) => {
        const file = e.target.files?.[0] ?? null;

        if (type === "product") {
            setProductImage(file);
            return;
        }

        setModelImage(file);
    };

    const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsGenerating(true);
        if(!user) {
            setIsGenerating(false);
            return toast('Please login to generate')
        }
        
         if (!productImage || !modelImage || !name || !productName || !aspectRatio) {
            setIsGenerating(false);
            return toast ('Please fill all the required fields')
         }

         try {
            setIsGenerating(true);
            const token = await getToken()
            const formData = new FormData()

            formData.append('name', name)
            formData.append('productName', productName)
            formData.append('productDescription', productDescription)
            formData.append('userPrompt', userPrompt)
            formData.append('aspectRatio', aspectRatio)
            formData.append('images', productImage)
            formData.append('images', modelImage)

            const { data } = await api.post('/api/project/create', formData, {
                headers: { Authorization: `Bearer ${token}`}
            })

            window.dispatchEvent(new Event(CREDITS_REFRESH_EVENT))
            toast.success(data.message)
            navigate('/result/' + data.projectId)

         } catch (error:any) {
            setIsGenerating(false);
            toast.error(error?.response?.data?.message || error.message)
         }
            


        // Placeholder until the generation flow is wired up.
        window.setTimeout(() => setIsGenerating(false), 600);
    };

    

    return (
        <div className="min-h-screen px-6 pb-24 pt-32 text-slate-900 md:px-12">
            <form onSubmit={handleGenerate} className="mx-auto max-w-6xl">
                <Title
                    heading="Create In-Context Image"
                    description="Upload your product and model images, then describe the scene you want to generate."
                />

                <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <UploadZone
                            label="Product Image"
                            file={productImage}
                            onClear={() => setProductImage(null)}
                            onChange={(e) => handleFileChange(e, "product")}
                        />
                        <UploadZone
                            label="Model Image"
                            file={modelImage}
                            onClear={() => setModelImage(null)}
                            onChange={(e) => handleFileChange(e, "model")}
                        />
                    </div>

                  { /* right col */}
                    <div className="surface-panel w-full p-6 text-slate-700 md:p-8">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium mb-3 text-slate-700">Project Name</label>
                            <input type="text" id="name" value={name} onChange={(e)=> setName (e.target.value)} placeholder="Name your project"  className="input-shell"/>
                        </div>
                         <div className="mb-4 text-slate-700">
                            <label htmlFor="productName" className="block text-sm font-medium mb-3 text-slate-700">Product Name</label>
                            <input type="text" id="productName" value={productName} onChange={(e)=>setProductName (e.target.value)} placeholder="Enter the name of the product"  className="input-shell"/>
                        </div>
                        <div className="mb-4 text-slate-700">
                            <label htmlFor="productDescription" className="block text-sm font-medium mb-3 text-slate-700">Product Description <span className="text-xs text-blue-600">(optional)</span></label>
                            <textarea id="productDescription" rows={4} value={productDescription} onChange={(e)=>setProductDescription(e.target.value)} placeholder="Enter the description of the product" className="input-shell resize-none" />
                        </div>
                        <div className="mb-4 text-slate-700">
                            <label className="block text-sm font-medium mb-3 text-slate-700">Aspect Ratio</label>
                            <div className="flex gap-3">
                                 <RectangleVerticalIcon onClick={()=> setAspectRatio('9:16')} className={`p-2.5 size-13 rounded-2xl border transition-all cursor-pointer ${aspectRatio === '9:16' ? 'border-blue-400 bg-blue-50 text-blue-700 ring-4 ring-blue-100' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700'}`} />
                                 <RectangleHorizontalIcon onClick={()=> setAspectRatio('16:9')} className={`p-2.5 size-13 rounded-2xl border transition-all cursor-pointer ${aspectRatio === '16:9' ? 'border-blue-400 bg-blue-50 text-blue-700 ring-4 ring-blue-100' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700'}`} />
                            </div>
                        </div>
                            <div className="mb-4 text-slate-700">
                            <label htmlFor="userPrompt" className="block text-sm font-medium mb-3 text-slate-700">User Prompt <span className="text-xs text-blue-600">(optional)</span></label>
                            <textarea id="userPrompt" rows={4} value={userPrompt} onChange={(e)=>setUserPrompt(e.target.value)} placeholder="Describe how you want the narration to be." className="input-shell resize-none" />
                        </div>
                     <p></p>
                    </div>
                </div>
                <div className="flex justify-center mt-10">
                     <PrimaryButton disabled={isGenerating} className="px-10 py-3 rounded-full disabled:opacity-70 disabled:cursor-not-allowed">
                        {isGenerating ? (<><Loader2Icon className="size-5 animate-spin" /> Generating...</>) :( <> <Wand2Icon className="size-5" /> Generate Image</>)}
                     </PrimaryButton>
                </div>
            </form>
        </div>
    );
};

export default Generator;
