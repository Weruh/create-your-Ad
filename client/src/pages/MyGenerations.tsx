import { useEffect, useState } from "react"
import type { Project } from "../Types"
import { Loader2Icon } from "lucide-react"
import ProjectCard from "../components/ProjectCard"
import { PrimaryButton } from "../components/Buttons"
import { useAuth, useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"
import api from "../configs/axios"
import toast from "react-hot-toast"


const MyGenerations = () => {

    const {user, isLoaded} = useUser()
    const { getToken }  = useAuth()
    const navigate = useNavigate()


    
    const [generations, setGenerations] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
  
    const fetchMyGenerations = async ()=>{
        try {
          const token = await getToken();
          const { data } = await api.get('/api/user/projects', {
            headers: { Authorization: `Bearer ${token}`}
          })
          setGenerations(data.projects)
          setLoading(false)
        } catch (error: any) {
          toast.error(error?.response?.data?.message || error.message)
        }
    }
  
    useEffect(()=>{
      if (user) {
        fetchMyGenerations()
      } else if (isLoaded && !user) {
        navigate('/')
      }
      
    },[user])
  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
       <Loader2Icon className="size-7 animate-spin text-blue-600" />
    </div>
  ) : (
      <div className="min-h-screen text-slate-900 px-6 pb-6 pt-28 md:px-12 md:pb-12">
      <div className="max-w-6xl mx-auto">
         <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-950">My Generations</h1>
          <p className="text-slate-500">View and manage your AI-generated content.</p>
         </header>

         {/* generations list */}
         <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
           {generations.map((gen)=>(<div>  <ProjectCard key={gen.id} gen={gen} setGenerations={setGenerations}/>  </div>))}
         </div>

         {generations.length === 0 && (
          <div className="surface-panel text-center py-20">
            <h3 className="text-xl font-medium mb-2 text-slate-900">No generations yet</h3>
            <p className="text-slate-500 mb-6">Start creating stunning product photos today</p>
            <PrimaryButton onClick={()=>window.location.href = '/generate'}>
              Create New Generation
            </PrimaryButton>
          </div>
         )

         }
      </div>
    </div>
  )
}

export default MyGenerations
