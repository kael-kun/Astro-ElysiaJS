import type { GenerateBlogInput } from "./generate-blog.types";

export interface BlogMetadata {
  title: string;
  description: string;
  meta_description: string;
}

export async function generateBlogMetadata(input: GenerateBlogInput, env: Env): Promise<BlogMetadata> {
  const { topic, keywords, tone, audience } = input;

  const systemPrompt = `You are an expert SEO content writer. Generate ONLY valid JSON for blog metadata. Do not output markdown code blocks. Ensure the JSON is fully closed with a closing brace '}'.`;

  const userPrompt = `
Generate SEO metadata for a blog post:
TOPIC: ${topic}
${keywords ? `KEYWORDS: ${keywords}\n` : ""}
TONE: ${tone}
AUDIENCE: ${audience}

Output format (strictly valid JSON):
{
  "title": "String (max 60 chars)",
  "description": "String (50-160 chars)",
  "meta_description": "String (150-160 chars)"
}

STRICT RULES:
1. Output ONLY raw JSON. No markdown (no \`\`\`).
2. Ensure the JSON object is completely closed with '}'.
3. Do not truncate the output.
`;

  const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt.trim() },
    ],
    max_tokens: 600,
  });

  // 1. Extract text safely
  let rawContent = "";
  if (typeof response === "string") {
    rawContent = response;
  } else if (response && typeof response === "object" && "content" in response) {
    rawContent = (response as any).content;
  } else if (response && typeof response === "object" && "response" in response) {
    rawContent = (response as any).response;
  } else {
    throw new Error("Unexpected AI response structure");
  }

  // 2. Clean Markdown
  let cleanedJson = rawContent
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  // 3. Auto-Repair Truncated JSON
  // If the JSON starts with '{' but doesn't end with '}', add the missing closing brace.
  if (cleanedJson.startsWith("{") && !cleanedJson.endsWith("}")) {
    // Check if it ends with a quote first (common cut-off point)
    if (cleanedJson.endsWith('"')) {
      cleanedJson += "}";
    } else {
      // If it cut off mid-value, try to close the string and then the object
      // This is a best-effort repair
      cleanedJson = cleanedJson + '"}';
    }
    console.warn("Detected truncated JSON from AI. Attempted auto-repair.");
  }

  try {
    const metadata = JSON.parse(cleanedJson) as BlogMetadata;

    // Basic validation
    if (!metadata.title || !metadata.description || !metadata.meta_description) {
      throw new Error("Generated JSON is missing required fields");
    }

    return metadata;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.error("Failed Raw Content:", rawContent);
    console.error("Attempted Cleaned Content:", cleanedJson);

    return {
      title: `Insights on ${topic}`,
      description: `Explore ${topic} with our latest guide.`,
      meta_description: `Learn more about ${topic}. Expert analysis and trends.`,
    };
  }
}

export async function generateBlogContent(input: GenerateBlogInput, env: Env): Promise<ReadableStream> {
  const { topic, keywords, tone, audience } = input;

  const systemPrompt = `You are an expert SEO content writer specializing in creating high-ranking, human-centered blog content. 
  You follow Google's E-E-A-T guidelines (Experience, Expertise, Authoritativeness, Trustworthiness) and modern SEO best practices:
  - Naturally integrate keywords without stuffing
  - Prioritize readability and user value over keyword density
  - Structure content with proper markdown formatting
  - Include latent semantic indexing (LSI) keywords contextually
  - Maintain consistent tone and audience targeting
  - Output ONLY the final blog content with no commentary, disclaimers, or meta-comments`;

  const userPrompt = `
Create a comprehensive, SEO-optimized blog post with these specifications:
TOPIC: ${topic}
${keywords ? `PRIMARY KEYWORDS: ${keywords}\n` : ""}
TONE: ${tone}
AUDIENCE: ${audience}

CONTENT REQUIREMENTS:
1. TITLE: Create a compelling, click-worthy title under 60 characters containing the main keyword
2. STRUCTURE (use markdown formatting):
   - Start with # for H1 title
   - Introduction: Hook readers in first sentence, include primary keyword naturally
   - 4-6 thematic sections with descriptive ## subheadings (H2), each section should have 3-5 sentences minimum
   - Use ### for subsections (H3) where needed, include examples, tips, or actionable advice
   - Include 2-3 bullet points or numbered lists per section for scannability
   - Conclusion with strong CTA relevant to audience
 3. MARKDOWN FORMATTING RULES:
   - H1: # Title
   - H2: ## Subheading
   - H3: ### Sub-subheading
   - Bold: **text**
   - Italic: *text*
   - Bullet list: - item
   - Numbered list: 1. item
   - No HTML tags allowed
4. SEO ELEMENTS:
   - Place primary keyword in first 100 words
   - Distribute keywords naturally (density 0.5-1.5%)
   - Include 3-5 LSI keywords contextually
5. AUDIENCE TARGETING:
   - Address ${audience} directly using "you"
   - Solve specific pain points for this audience
   - Match ${tone} tone consistently
6. ADDITIONAL SECTIONS:
   - Add a "Common Mistakes" or "Tips & Tricks" section to increase depth
   - Include a "FAQs" section at the end, formatted as: ### Q: Question  \\n**A:** Answer, with at least 4-5 FAQs
7. STRICT RULES:
   - NEVER mention word count in content
   - NEVER add disclaimers like "As an AI..."
   - Output ONLY the final markdown blog content
   - NO HTML TAGS allowed

IMPORTANT:
- The blog should be detailed and informative, suitable for a long-form article
- Include examples, actionable advice, and insights to make content engaging and valuable`;

  const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: userPrompt.trim() },
    ],
    max_tokens: 2048,
    stream: true,
  });

  return response as ReadableStream;
}
