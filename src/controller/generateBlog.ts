type requestBody = {
  topic: string;
  keywords?: string;
  tone: string;
  audience: string;
  wordCount: number;
};

export async function generateBlog(body: requestBody, env: Env) {
  const { topic, keywords, tone, audience, wordCount } = body;

  // Optimized system prompt for SEO content creation
  const systemPrompt = `You are an expert SEO content writer specializing in creating high-ranking, human-centered blog content. 
  You follow Google's E-E-A-T guidelines (Experience, Expertise, Authoritativeness, Trustworthiness) and modern SEO best practices:
  - Naturally integrate keywords without stuffing
  - Prioritize readability and user value over keyword density
  - Structure content with proper markdown formatting
  - Include latent semantic indexing (LSI) keywords contextually
  - Maintain consistent tone and audience targeting
  - Output ONLY the final blog content with no commentary, disclaimers, or meta-comments`;

  // Construct detailed user prompt with all parameters
  const userPrompt = `
Create an SEO-optimized blog post with these specifications:
TOPIC: ${topic}
${keywords ? `PRIMARY KEYWORDS: ${keywords}\n` : ""}
TONE: ${tone}
AUDIENCE: ${audience}
TARGET LENGTH: ${wordCount} words (±10%)

CONTENT REQUIREMENTS:
1. TITLE: Create a compelling, click-worthy title under 60 characters containing the main keyword
2. META DESCRIPTION: Generate a separate meta description (155 chars) after the content (label as "META_DESCRIPTION:")
3. STRUCTURE (use markdown formatting):
   - Start with # for H1 title
   - Introduction: Hook readers in first sentence, include primary keyword naturally
   - 3-5 thematic sections with descriptive ## subheadings (H2)
   - Use ### for subsections (H3) where needed
   - Include 1-2 bullet points or numbered lists for scannability
   - Conclusion with strong CTA relevant to audience
4. MARKDOWN FORMATTING RULES:
   - H1: # Title
   - H2: ## Subheading
   - H3: ### Sub-subheading
   - Bold: **text**
   - Italic: *text*
   - Bullet list: - item
   - Numbered list: 1. item
   - Links: [anchor text](placeholder-url)
   - No HTML tags allowed
5. SEO ELEMENTS:
   - Place primary keyword in first 100 words
   - Distribute keywords naturally (density 0.5-1.5%)
   - Include 2-3 LSI keywords contextually
   - Add 1 strategic internal link placeholder: [internal link](/relevant-topic)
   - Add 1 authoritative external link placeholder: [authoritative source](https://example.gov)
6. AUDIENCE TARGETING:
   - Address ${audience} directly using "you"
   - Solve specific pain points for this audience
   - Match ${tone} tone consistently
7. ADDITIONAL SECTIONS:
   - Include exactly ${Math.floor(wordCount / 300)} relevant FAQs at end
   - Format FAQs as: ### Q: Question  \n**A:** Answer
8. STRICT RULES:
   - NEVER mention word count in content
   - NEVER add disclaimers like "As an AI..."
   - NEVER exceed ${wordCount * 1.1} total words
   - Output ONLY markdown content + meta description section
   - Place META_DESCRIPTION at very end after content
   - NO HTML TAGS allowed`;

  // Execute AI generation with optimized prompts
  const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: userPrompt.trim() },
    ],
  });

  return response;
}
