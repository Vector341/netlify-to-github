"use client"

import { useState } from "react"
import { downloadRepo } from "../actions/downloadRepo"

export default function RepoDownloader() {
  const [owner, setOwner] = useState("")
  const [repo, setRepo] = useState("")
  const [ref, setRef] = useState("main")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDownloadUrl("")

    const result = await downloadRepo(owner, repo, ref)

    if (result.success) {
      setDownloadUrl(result.downloadUrl)
    } else {
      setError(result.error || "An error occurred")
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleDownload} className="space-y-4">
        <div>
          <label htmlFor="owner">Owner</label>
          <input 
            id="owner" 
            value={owner} 
            onChange={(e) => setOwner(e.target.value)} 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="repo">Repository</label>
          <input 
            id="repo" 
            value={repo} 
            onChange={(e) => setRepo(e.target.value)} 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="ref">Branch/Tag (optional)</label>
          <input 
            id="ref" 
            value={ref} 
            onChange={(e) => setRef(e.target.value)} 
            placeholder="main"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Downloading..." : "Download Repository"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {downloadUrl && (
        <div className="mt-4">
          <p className="text-green-500">Repository downloaded successfully!</p>
          <a href={downloadUrl} download className="text-blue-500 underline">
            Click here to download the ZIP file
          </a>
        </div>
      )}
    </div>
  )
}
