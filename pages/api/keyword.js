import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // 使用环境变量存储API密钥
})

const extractKeywords = async (text) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // 或者使用 'gpt-4'，取决于你的需求和访问权限
    messages: [
      {
        role: "system",
        content:
          "你是一个专业的关键词提取助手。请从给定的文本中提取出最重要的关键词。"
      },
      {
        role: "user",
        content: `请从以下文本中提取5个最重要的关键词，用逗号分隔：\n\n${text}`
      }
    ],
    max_tokens: 60,
    n: 1,
    temperature: 0.5
  })

  return response.choices[0].message.content.trim().split(",")
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
