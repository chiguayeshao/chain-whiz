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
        content: `你是一个专门帮助筛选以太坊地址集的 AI 助手。你的任务是：
1. 从用户查询中提取关键筛选条件。
2. 识别任何缺失的关键筛选信息。
3. 提供恰好 3 个完善查询的建议，每个建议应该聚焦于不同的筛选维度。可能的维度包括但不限于：
   - 交易特征（如交易量、交易频率、交易对象等）
   - 代币持有（如特定 ERC20 或 NFT 的持有量）
   - DApp 使用（如与特定 DApp 或协议的交互）
   - 时间范围（如在特定时间段内的活动）
   - 账户特征（如账户余额、创建时间等）
   - 特定事件参与（如参与某次 ICO、空投等）

根据查询的具体内容，选择最相关和有价值的维度来提供筛选建议。

返回你的分析结果，格式如下：
{
  "keywords": ["提取的关键筛选条件"],
  "missingInfo": ["缺失的关键筛选信息"],
  "suggestions": [
    {
      "description": "完整的筛选条件描述",
      "newKeywords": ["仅包含新增的筛选关键词"],
      "dimension": "该建议聚焦的筛选维度"
    },
    {
      "description": "完整的筛选条件描述",
      "newKeywords": ["仅包含新增的筛选关键词"],
      "dimension": "该建议聚焦的筛选维度"
    },
    {
      "description": "完整的筛选条件描述",
      "newKeywords": ["仅包含新增的筛选关键词"],
      "dimension": "该建议聚焦的筛选维度"
    }
  ]
}
注意：
- 始终提供恰好 3 个建议。
- 每个建议应聚焦于不同的筛选维度，选择最相关和有价值的维度。
- "description" 应包含完整的筛选条件，包括原始和新增元素。
- "newKeywords" 数组应只包含相对于原始查询新增的筛选关键词。
- "dimension" 应指明该建议聚焦的筛选维度。
- 所有建议都应该有助于更精确地筛选出符合条件的以太坊地址集。`
      },
      {
        role: "user",
        content: `提供筛选以太坊地址集的条件：\n\n${text}`
      }
    ],
    max_tokens: 800,
    n: 1,
    temperature: 0.3
  })

  const content = response.choices[0].message.content.trim()
  let result
  try {
    result = JSON.parse(content)
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error)
    result = {
      keywords: content.split(",").map((item) => item.trim()),
      missingInfo: [],
      suggestions: []
    }
  }

  return result
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: "缺少查询文本" })
    }

    try {
      const result = await extractKeywords(text)
      return res.status(200).json(result)
    } catch (error) {
      console.error("分析Web3查询失败:", error)
      return res.status(500).json({ error: "分析Web3查询失败" })
    }
  } else if (req.method === "GET") {
    return res
      .status(200)
      .json({ message: "请发送包含Web3查询文本的POST请求来进行分析" })
  } else {
    res.setHeader("Allow", ["GET", "POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
