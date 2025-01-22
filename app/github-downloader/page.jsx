import RepoDownloader from "./components/RepoDownloader"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">GitHub Repository Downloader</h1>
      <RepoDownloader />
    </div>
  )
}
