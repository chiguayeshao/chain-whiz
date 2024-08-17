import React, { useState, useEffect } from "react"
import Head from "next/head"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Smile,
  Wrench,
  AlertTriangle,
  Sun,
  Moon,
  Search,
  ArrowRight,
  Loader2
} from "lucide-react"

const AIAssistant = () => {
  const [searchText, setSearchText] = useState("")
  const [keywords, setKeywords] = useState([])
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSearch = async (text = searchText) => {
    if (!text.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch("/api/keyword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text })
      })
      const data = await response.json()
      setKeywords(data.keywords)
      setSuggestions(data.suggestions)
      setSelectedKeywords([])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const toggleKeyword = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    )
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchText(suggestion.description)
    handleSearch(suggestion.description)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-[#19191C] text-black dark:text-white p-8 transition-colors duration-200">
      <Head>
        <title>AI Assistant with Keyword Search</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Tabs defaultValue="individual">
            <TabsList>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="Business">Business</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block bg-pink-200 dark:bg-pink-800 rounded-full p-2 mb-4">
            <div className="w-16 h-16 bg-blue-300 dark:bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-4xl">😊</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">How can I help you today?</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <FeatureCard
            icon={<Smile className="w-6 h-6" />}
            title="Examples"
            items={[
              "Explain quantum computing in simple terms",
              "Got any creative ideas for a 10 year old' birthday?",
              "How do I make an HTTP request in Javascript?"
            ]}
          />
          <FeatureCard
            icon={<Wrench className="w-6 h-6" />}
            title="Capabilities"
            items={[
              "Remembers what user said earlier in the conversation",
              "Allows user to provide follow-up corrections",
              "Trained to decline inappropriate requests"
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {suggestions.map((suggestion, index) => (
            <SuggestionButton
              key={index}
              text={suggestion.description}
              subtext={suggestion.dimension}
              newKeywords={suggestion.newKeywords}
              onClick={() => handleSuggestionClick(suggestion)}
            />
          ))}
        </div>

        <div className="relative mb-6">
          <div className="relative">
            <Input
              className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 pl-12 pr-12 py-6 rounded-full"
              placeholder="Enter a prompt here"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => handleSearch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {keywords.map((keyword, index) => (
              <Button
                key={index}
                variant={
                  selectedKeywords.includes(keyword) ? "default" : "outline"
                }
                className="rounded-full"
                onClick={() => toggleKeyword(keyword)}
              >
                {keyword}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, items }) => (
  <Card className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
    <CardContent className="p-6">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-lg font-semibold ml-2">{title}</h2>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

const SuggestionButton = ({ text, subtext, newKeywords, onClick }) => (
  <Button
    variant="outline"
    className="h-auto py-2 px-4 justify-start text-left"
    onClick={onClick}
  >
    <div>
      <div className="font-medium">{text}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{subtext}</div>
      {newKeywords && newKeywords.length > 0 && (
        <div className="text-xs text-blue-500 mt-1">
          新增关键词: {newKeywords.join(", ")}
        </div>
      )}
    </div>
  </Button>
)

export default AIAssistant
