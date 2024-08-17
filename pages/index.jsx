import React, { useState, useEffect } from "react"
import Head from "next/head"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Smile,
  Wrench,
  AlertTriangle,
  Sun,
  Moon,
  Search,
  ArrowRight,
  Loader2,
  DollarSign,
  ExternalLink,
  Download
} from "lucide-react"

const AIAssistant = () => {
  const [searchText, setSearchText] = useState(
    "Find the latest 10 swap transactions exceeding $1 million"
  )
  const [keywords, setKeywords] = useState([])
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [swapData, setSwapData] = useState([])
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedOption, setSelectedOption] = useState("option1")

  useEffect(() => setMounted(true), [])

  const handleSearch = async (text = searchText) => {
    if (!text.trim()) return
    setIsLoading(true)
    try {
      // Keyword search
      const keywordResponse = await fetch("/api/keyword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text })
      })
      const keywordData = await keywordResponse.json()
      setKeywords(keywordData.keywords)
      setSuggestions(keywordData.suggestions)
      setSelectedKeywords([])

      // Parse user input for amount and count
      const amountMatch = text.match(/(\d+)万美金/)
      const countMatch = text.match(/(\d+)笔/)

      const amount = amountMatch ? parseInt(amountMatch[1]) * 10000 : 1000000 // Default to 1 million if not specified
      const count = countMatch ? parseInt(countMatch[1]) : 5 // Default to 5 if not specified

      // Construct GraphQL query based on keywords and parsed values
      const queryKeywords = keywordData.keywords.slice(0, 3) // Using first 3 keywords
      const whereConditions = queryKeywords
        .map((keyword) => `{tokenSymbol_contains_nocase: "${keyword}"}`)
        .join(", ")

      const query = `
        {
          swaps(
            first: ${count}, 
            orderBy: timestamp, 
            orderDirection: desc, 
            where: { 
              amountUSD_gt: "${amount}",
            }
          ) {
            id
            transaction { id }
            sender
            amountUSD
          }
        }
      `

      const graphResponse = await fetch(
        `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THE_GRAPH_API_KEY}/subgraphs/id/HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query })
        }
      )
      const graphData = await graphResponse.json()
      setSwapData(graphData.data.swaps)
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
        <title>The first AI-driven aggregation gateway.</title>
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
          <div className="mb-4 flex items-center justify-center">
            <Image
              src="/logo.png"
              width={88}
              height={88}
              alt="Company Logo"
              className="rounded-[15px]"
            />
          </div>
          <h1 className="text-2xl font-bold">
            The first AI-driven aggregation gateway that empowers effortless
            natural language exploration of everything on-chain.
          </h1>
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

        <div className="relative mb-6 flex items-center space-x-2">
          <div className="relative flex-grow">
            <Input
              className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 pl-12 pr-12 py-6 rounded-full"
              placeholder="Find the latest 10 swap transactions exceeding $1 million"
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
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="w-[220px] bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 rounded-full py-6">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700">
              <SelectItem value="option1">
                <div className="flex items-center">
                  <Image
                    src="/thegraph.png"
                    width={24}
                    height={24}
                    alt="Logo 1"
                    className="mr-2 rounded-full"
                  />
                  <span>The Graph</span>
                </div>
              </SelectItem>
              <SelectItem value="option2" disabled>
                <div className="flex items-center">
                  <Image
                    src="/dune.png"
                    width={24}
                    height={24}
                    alt="Logo 2"
                    className="mr-2 rounded-full"
                  />
                  <span>Dune</span>
                </div>
              </SelectItem>
              <SelectItem value="option3" disabled>
                <div className="flex items-center">
                  <Image
                    src="/nansen.png"
                    width={24}
                    height={24}
                    alt="Logo 3"
                    className="mr-2 rounded-full"
                  />
                  <span>Nansen</span>
                </div>
              </SelectItem>
              <SelectItem value="option4" disabled>
                <div className="flex items-center">
                  <Image
                    src="/footprint.png"
                    width={24}
                    height={24}
                    alt="Logo 3"
                    className="mr-2 rounded-full"
                  />
                  <span>Footprint</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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

        {swapData.length > 0 && (
          <FeatureCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Data"
            items={swapData}
          />
        )}
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, items }) => {
  const downloadCSV = () => {
    const headers = ["Transaction", "Sender", "Amount"]
    const csvContent = [
      headers.join(","),
      ...items.map(
        (swap) =>
          `${swap.transaction.id},${swap.sender},${parseFloat(swap.amountUSD).toFixed(2)}`
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "swap_data.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h2 className="text-lg font-semibold ml-2">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={downloadCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto pr-2">
          <ul className="space-y-4">
            {items.map((swap, index) => (
              <li
                key={index}
                className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Transaction:</span>
                  <a
                    href={`https://etherscan.io/tx/${swap.transaction.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    {`${swap.transaction.id.slice(0, 5)}...${swap.transaction.id.slice(-5)}`}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Sender:</span>
                  <a
                    href={`https://etherscan.io/address/${swap.sender}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    {`${swap.sender.slice(0, 5)}...${swap.sender.slice(-5)}`}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Amount:</span>
                  <span className="text-green-500">
                    ${parseFloat(swap.amountUSD).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

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
