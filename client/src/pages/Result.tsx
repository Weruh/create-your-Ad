import { useEffect, useState } from "react"
import type { Project } from "../Types"
import { ImagesIcon, Loader2Icon, RefreshCcwIcon, SparkleIcon, VideoIcon } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { GhostButton, PrimaryButton } from "../components/Buttons"
import { useAuth, useUser } from "@clerk/react"
import axios from "axios"
import api from "../configs/axios"
import toast from "react-hot-toast"

const CREDITS_REFRESH_EVENT = 'credits:refresh'

const Result = () => {
  const {getToken} = useAuth()
  const { user, isLoaded} = useUser()
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()

  const [project, setProjectData] = useState<Project>({} as Project)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message
    }

    if (error instanceof Error) {
      return error.message
    }

    return "Something went wrong"
  }

  const fetchProjectData = async ()=>{
       if (!projectId) {
        toast.error("Project not found")
        setLoading(false)
        navigate("/generate")
        return
       }

       try {
        const token = await getToken()
        const { data } = await api.get(`/api/user/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProjectData(data.project)
        setIsGenerating(data.project.isGenerating)
        setLoading(false)
       } catch (error) {
        toast.error(getErrorMessage(error))
        console.log(error)
        setLoading(false)
       }
  }

   const handleGenerateVideo = async () => {
    if (!projectId) {
      toast.error("Project not found")
      return
    }

    setIsGenerating(true)

    try {
      const token = await getToken()
      const { data } = await api.post('/api/project/video', {projectId}, {
        headers: { Authorization: `Bearer ${token}`}
      })

      setProjectData(prev => ({...prev, generatedVideo: data.videoUrl, isGenerating: false}))
      window.dispatchEvent(new Event(CREDITS_REFRESH_EVENT))
      toast.success(data.message);
      setIsGenerating(false);

    } catch (error) {
      toast.error(getErrorMessage(error))
      console.log(error)
      setIsGenerating(false)
    }
   }
  

  useEffect(()=>{
    if (user && !project.id) {
      fetchProjectData()
    }else if (isLoaded && !user) {
      navigate('/')
    }
    
  },[user])

  // fetch project every 10 seconds
     useEffect(()=>{
      if (user && isGenerating) {
        const interval = setInterval(()=> {
          fetchProjectData()
        },10000);
        return ()=> clearInterval(interval)
      }
     },[user, isGenerating])




  return loading ?  (
    <div className="h-screen w-full flex items-center justify-center">
       <Loader2Icon className="animate-spin text-blue-600 size-9" />
    </div>
  ) : (
    <div className="min-h-screen text-slate-900 p-6 md:p-12 mt-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-medium text-slate-950">Generation Result </h1>
          <Link to="/generate" className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCcwIcon className="w-4 h-4" />
          <p className="max-sm:hidden">New Generation</p>
          </Link>
        </header>

        {/* grid layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* main result display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel inline-block p-2 rounded-2xl">
              <div className={`${project?.aspectRatio === '9:16' ? 'aspect-9/16' : 'aspect-video'} sm:max-h-200 rounded-xl bg-slate-100 overflow-hidden relative`}>
                {project?.generatedVideo ? (
                  <video src={project.generatedVideo} controls autoPlay loop className="w-full h-full object-cover" />
                ) : (
                  <img src={project.generatedImage} alt="Generated Result" className="w-full h-full object-cover" />
                ) }
              </div>

            </div>

          </div>

          {/* sidebar actions */}
          <div className="space-y-6">
            {/* download buttons */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4 text-slate-950">Actions</h3>
                <div className="flex flex-col gap-3">
                  <a href={project.generatedImage} download>
                    <GhostButton disabled={!project.generatedImage} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ImagesIcon className="size-4.5" />
                        Download Image
                    </GhostButton>
                  </a>
                   <a href={project.generatedVideo} download>
                    <GhostButton disabled={!project.generatedVideo} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                      <VideoIcon className="size-4.5" />
                        Download Video
                    </GhostButton>
                  </a>
                </div>
            </div>
            {/* generate video button */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-700">
                 <VideoIcon className="size-24" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-950">Video Magic</h3>
              <p className="mb-5 text-slate-600">Turn this static image into a dynamic video for social media.</p>
              {!project.generatedVideo ? (
                <PrimaryButton onClick={handleGenerateVideo} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>Generating Video...</>
                  ) : (
                    <><SparkleIcon className="size-4" /> Generate Video</>
                  )} 
                </PrimaryButton>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-center text-sm font-medium">
                  Video Generated Successfully!
                </div>
              )

              }

            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Result
