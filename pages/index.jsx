import Head from "next/head"
import { useState } from "react"

const Home = () => {
  const [searchText, setSearchText] = useState("")
  const [keywords, setKeywords] = useState([])

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/keyword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: searchText })
      })
      const data = await response.json()
      setKeywords(data.keywords)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>关键词搜索</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-center">
              关键词搜索
            </h1>

            <div className="mb-4">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="输入搜索文本"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
            >
              搜索关键词
            </button>

            {keywords.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">提取的关键词:</h2>
                <ul className="list-disc pl-5">
                  {keywords.map((keyword, index) => (
                    <li key={index} className="mb-1">
                      {keyword}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
