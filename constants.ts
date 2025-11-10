export const INPUT_ANALYSIS_PROMPT = `
你是一位专业的市场分析师。用户提供了一些内容，请根据以下指示进行分析。

所提供的内容可能是以下类型之一：
| 类型 | 解释 |
|---|---|
| 产品/服务 | 关于一个产品或服务的介绍。 |
| 知识交付 | 旨在交付给用户的知识性成果，如报告、课程或推荐。 |
| 服务过程 | 对客户服务互动的描述或对话记录。 |

请分析用户的内容，并以Markdown格式输出以下信息：

### 分析类型
<从上表中识别并陈述一个类型>

### 分析对象
<简明扼要地总结内容>

### 目标人群
<详细描述此内容的目标用户或客户群体>
`;

export const USER_PERSONA_TEMPLATE = `{
  "user_id": "U0001",
  "name": "小雅，加班族",
  "tagline": "月薪8k的精致省钱主义者",
  "demographics": {
    "gender": "女",
    "age": 26,
    "city_tier": "新一线城市",
    "education": "本科",
    "occupation": "互联网运营",
    "monthly_income": "8k-12k"
  },
  "quotes": [
    "只有晚上10点以后才有钱有闲逛淘宝",
    "为了凑满减，我又多买了3盒面膜"
  ],
  "daily_routine": "上午9点到晚上9点上班，晚上10点到凌晨1点躺在床上刷手机",
  "needs": [
    "快速解压",
    "物美价廉",
    "节省决策时间"
  ],
  "pains": [
    "促销规则太复杂",
    "担心买贵了",
    "信息过载"
  ],
  "psychology": {
    "motivation": "追求即时满足和社交认同",
    "friction": "害怕买后悔、怕麻烦"
  }
}`;

export const USER_PERSONA_GENERATION_PROMPT = (analysis: string) => `
根据 <CASE_SCENARIO> 中描述的目标受众，生成一个单一、详细且真实的用户画像。

请严格遵循 <USER_TEMPLATE> 中提供的 JSON 格式。不要复制模板中的内容；仅将其用作结构指南。你创建的用户画像必须完全符合所描述的目标受众。

<USER_TEMPLATE>
${USER_PERSONA_TEMPLATE}
</USER_TEMPLATE>

<CASE_SCENARIO>
${analysis}
</CASE_SCENARIO>

你的输出必须只有新用户画像的 JSON 对象，不能包含任何其他文本或 markdown 标记。
`;

export const EVALUATION_GENERATION_PROMPT = (persona: string, originalContent: string) => `
你将扮演 <USER_PROFILE> 中描述的用户。
你的任务是审查和评估 <REVIEW_OBJECT> 中提供的内容。
请从这个特定用户的视角思考，考虑他们的需求、痛点和动机。

<USER_PROFILE>
${persona}
</USER_PROFILE>

<REVIEW_OBJECT>
${originalContent}
</REVIEW_OBJECT>

现在，作为这位用户，请提供你详细的感受和评价。请使用以下 Markdown 结构组织你的回答：

### 用户：[你的画像名称]
**我的感受和评价：**
... (在这里根据你的画像，用第一人称写下详细的评价) ...

**我的简介：**
... (用第一人称简单介绍一下自己，要与你的画像保持一致) ...
`;

export const SUMMARY_PROMPT = (comments: string[]) => `
你是一位高级产品分析师。现在提供给你一系列用户的评价，见 <COMMENTS>。
你的任务是分析所有这些评论，并生成一份全面的摘要报告（Markdown格式）。

<COMMENTS>
${comments.join('\n\n---\n\n')}
</COMMENTS>

根据所有评论，请完成以下任务：
1. 为每位用户估算他们的净推荐值（NPS），评分范围为0-10分，其中0分代表“绝不推荐”，10分代表“极力推荐”。
2. 汇总反馈，识别出共同的主题。

请按以下结构生成报告：

### 整体情况汇总
*   **总样本数：** <用户数量>
*   **平均NPS评分 (0-10分)：** <计算平均分>
*   **主要优点：** <列出普遍受到称赞的方面>
*   **主要缺点：** <列出普遍受到批评的方面>
*   **用户主要顾虑：** <列出普遍存在的犹豫或担忧>

### 用户评价概览
<生成一个Markdown表格，总结每位用户的反馈>
| 用户名 | NPS评分 (0-10分) | 肯定的点 | 否定的点 | 主要顾虑 |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
`;

export const FINAL_REPORT_TEMPLATE = (analysis: string, summary: string, comments: string[], personas: string[]) => `
# 评价报告

## 一、背景信息
${analysis}

---

## 二、整体评价汇总
${summary}

---

## 三、用户详细反馈
${comments.join('\n\n')}

---

## 附录：生成的用户画像
${personas.map(p => `\`\`\`json\n${p}\n\`\`\``).join('\n\n')}
`;