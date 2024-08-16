import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // 使用环境变量存储API密钥
})

const extractKeywords = async (text) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant specialized in analyzing Web3 user search queries. Your task is to extract key information from user queries, including but not limited to: blockchain networks, DApp names, token symbols, transaction types, numerical thresholds, etc. Please return these key pieces of information as an array."
      },
      {
        role: "user",
        content: `Analyze the following Web3 search query and extract key information. Return the results as an array:\n\n${text}`
      }
    ],
    max_tokens: 150,
    n: 1,
    temperature: 0.3
  })

  // Parse the returned content as an array
  const keywordsString = response.choices[0].message.content.trim()
  let keywords = []
  try {
    keywords = JSON.parse(keywordsString)
  } catch (error) {
    console.error("Failed to parse keywords:", error)
    keywords = keywordsString.split(",").map((item) => item.trim())
  }

  return keywords
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: "缺少文本内容" })
    }

    try {
      const keywords = await extractKeywords(text)
      return res.status(200).json({ keywords })
    } catch (error) {
      console.error("提取关键词失败:", error)
      return res.status(500).json({ error: "提取关键词失败" })
    }
  } else if (req.method === "GET") {
    return res
      .status(200)
      .json({ message: "发送包含文本内容的POST请求来提取关键词" })
  } else {
    res.setHeader("Allow", ["GET", "POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
