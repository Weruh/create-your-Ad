import { UploadIcon, XIcon } from "lucide-react"
import type { uploadZoneProps } from "../Types"


const UploadZone = ({label, file, onClear, onChange } :uploadZoneProps) => {
  return (
    <div className="relative group">
        <div className={`relative h-64 rounded-[1.75rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 ${file ? 'border-blue-400 bg-blue-50/80 shadow-[0_20px_50px_-30px_rgba(37,99,235,0.45)]' : 'border-slate-200 bg-white/80 hover:border-blue-300 hover:bg-blue-50/60'}`}>
        {file ? (
            <>
            <img src={URL.createObjectURL(file)} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-[1.55rem] opacity-65 " />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/35 rounded-[1.55rem] backdrop-blur-sm">
               <button type="button" onClick={onClear} className="p-2 rounded-full bg-white text-slate-700 shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors" >
               <XIcon className="w-6 h-6" />
               </button>

            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/85 backdrop-blur-md p-3 rounded-2xl border border-white/70">
                <p className="text-sm font-medium truncate text-slate-800">{file.name}</p>
            </div>
            </>
        ) : (
            <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex  items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
             <UploadIcon className="w-8 h-8 text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">{label}</h3>
            <p className="text-sm text-slate-500 text-center max-w-[200px]">Drag & drop or click to upload</p>
            <input type="file" accept="image/*" onChange={onChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
            </>
        )}
        </div>
    </div>
  )
}

export default UploadZone
