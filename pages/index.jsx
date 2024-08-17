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
  Loader2,
  DollarSign
} from "lucide-react"

const AIAssistant = () => {
  const [searchText, setSearchText] = useState("")
  const [keywords, setKeywords] = useState([])
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [swapData, setSwapData] = useState([])
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSearch = async (text = searchText) => {
    if (!text.trim()) return
    setIsLoading(true)
    try {
      // Parse user input
      const amountMatch = text.match(/(\d+)万美金/)
      const countMatch = text.match(/(\d+)笔/)

      const amount = amountMatch ? parseInt(amountMatch[1]) * 10000 : 1000000 // Default to 1 million if not specified
      const count = countMatch ? parseInt(countMatch[1]) : 10 // Default to 10 if not specified

      // Construct GraphQL query
      const query = `
        {
          swaps(
            first: ${count}, 
            orderBy: timestamp, 
            orderDirection: desc, 
            where: { 
              amountUSD_gt: "${amount}"
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

      // Set keywords for display
      setKeywords([`${amount / 10000}万美金`, `${count}笔交易`])
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

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-[#19191C] text-black dark:text-white p-8 transition-colors duration-200">
      <Head>
        <title>AI Assistant with Dynamic Swap Data Query</title>
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

        <div className="relative mb-6">
          <div className="relative">
            <Input
              className="w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700 pl-12 pr-12 py-6 rounded-full"
              placeholder="例如：查询swap超过100万美金的最近10笔交易"
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

        {swapData.length > 0 && (
          <FeatureCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Swap Transactions"
            items={swapData.map(
              (swap) =>
                `Token: ${swap.tokenSymbol} | Transaction: ${swap.transaction.id.slice(0, 10)}... | Sender: ${swap.sender.slice(0, 10)}... | Amount: $${parseFloat(swap.amountUSD).toFixed(2)} | Time: ${new Date(parseInt(swap.timestamp) * 1000).toLocaleString()}`
            )}
          />
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

export default AIAssistant
