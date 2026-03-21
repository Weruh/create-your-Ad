import { useEffect, useState } from "react"
import type { Project } from "../Types"
import { Loader2Icon } from "lucide-react"
import ProjectCard from "../components/ProjectCard"
import api from "../configs/axios"
import toast from "react-hot-toast"


const Community = () => {

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async ()=>{
      try {
        const { data } = await api.get('/api/project/published')
        setProjects(data.projects)
        setLoading(false)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message)
        console.log(error);
      }
  }

  useEffect(()=>{
    fetchProjects()
  },[])

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
       <Loader2Icon className="size-7 animate-spin text-blue-600" />
    </div>
  ) : (
    <div className="min-h-screen text-slate-900 px-6 pb-6 pt-28 md:px-12 md:pb-12">
      <div className="max-w-6xl mx-auto">
         <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-950">Community</h1>
          <p className="text-slate-500">See what others are creating with Admaker.</p>
         </header>

         {/* project list */}
         <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
           {projects.map((project)=>(<div>  <ProjectCard key={project.id} gen={project} setGenerations={setProjects} forCommunity={true}/>  </div>))}
         </div>
      </div>
    </div>
  )
}

export default Community
