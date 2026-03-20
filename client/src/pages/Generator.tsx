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
        <div className="min-h-screen px-6 pb-24 pt-32 text-white md:px-12">
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
                    <div className="w-full text-gray-300">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm mb-4">Project Name</label>
                            <input type="text" id="name" value={name} onChange={(e)=> setName (e.target.value)} placeholder="Name your project"  className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"/>
                        </div>
                         <div className="mb-4 text-gray-300">
                            <label htmlFor="productName" className="block text-sm mb-4">Product Name</label>
                            <input type="text" id="productName" value={productName} onChange={(e)=>setProductName (e.target.value)} placeholder="Enter the name of the product"  className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"/>
                        </div>
                        <div className="mb-4 text-gray-300">
                            <label htmlFor="productDescription" className="block text-sm mb-4">Product Description <span className="text-xs text-violet-400">(optional)</span></label>
                            <textarea id="productDescription" rows={4} value={productDescription} onChange={(e)=>setProductDescription(e.target.value)} placeholder="Enter the description of the product" className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all" />
                        </div>
                        <div className="mb-4 text-gray-300">
                            <label className="block text-sm mb-4">Aspect Ratio</label>
                            <div className="flex gap-3">
                                 <RectangleVerticalIcon onClick={()=> setAspectRatio('9:16')} className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${aspectRatio === '9:16' ? 'ring-violet-500/50 bg-white/10' : ''}`} />
                                 <RectangleHorizontalIcon onClick={()=> setAspectRatio('16:9')} className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${aspectRatio === '16:9' ? 'ring-violet-500/50 bg-white/10' : ''}`} />
                            </div>
                        </div>
                            <div className="mb-4 text-gray-300">
                            <label htmlFor="userPrompt" className="block text-sm mb-4">User Prompt <span className="text-xs text-violet-400">(optional)</span></label>
                            <textarea id="userPrompt" rows={4} value={userPrompt} onChange={(e)=>setUserPrompt(e.target.value)} placeholder="Describe how you want the narration to be." className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all" />
                        </div>
                     <p></p>
                    </div>
                </div>
                <div className="flex justify-center mt-10">
                     <PrimaryButton disabled={isGenerating} className="px-10 py-3 rounded-md disabled:opacity-70 disabled:cursor-not-allowed">
                        {isGenerating ? (<><Loader2Icon className="size-5 animate-spin" /> Generating...</>) :( <> <Wand2Icon className="size-5" /> Generate Image</>)}
                     </PrimaryButton>
                </div>
            </form>
        </div>
    );
};

export default Generator;
