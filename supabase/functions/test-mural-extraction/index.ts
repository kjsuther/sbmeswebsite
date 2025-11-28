import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExtractionRequest {
  url: string;
  username?: string;
  password?: string;
}

interface ExtractionResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    elementsFound?: number;
    processingTime?: number;
    extractionMethod?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();

  try {
    const { url, username, password }: ExtractionRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "URL is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!url.includes("mural.co")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid Mural URL. URL must contain 'mural.co'",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const fetchHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };

    if (username && password) {
      const authString = btoa(`${username}:${password}`);
      fetchHeaders["Authorization"] = `Basic ${authString}`;
    }

    const response = await fetch(url, {
      headers: fetchHeaders,
      redirect: "follow",
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch Mural board: ${response.status} ${response.statusText}`,
          metadata: {
            processingTime: Date.now() - startTime,
            extractionMethod: "direct-fetch",
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const html = await response.text();

    const extractedContent = extractContentFromHTML(html);

    if (!extractedContent || extractedContent.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not extract meaningful content from the Mural board. The board may use heavy JavaScript rendering that requires browser automation. Possible solutions: 1) Enable visitor access, 2) Provide valid credentials, 3) Use manual content entry, or 4) Future implementation with browser automation.",
          metadata: {
            processingTime: Date.now() - startTime,
            extractionMethod: "html-parsing",
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result: ExtractionResponse = {
      success: true,
      content: extractedContent,
      metadata: {
        elementsFound: countElements(extractedContent),
        processingTime: Date.now() - startTime,
        extractionMethod: "html-parsing",
      },
    };

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in test-mural-extraction:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during extraction",
        metadata: {
          processingTime: Date.now() - startTime,
          extractionMethod: "error",
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function extractContentFromHTML(html: string): string {
  const content: string[] = [];

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const title = decodeHtml(titleMatch[1].trim());
    if (title && !title.includes("MURAL") && title !== "MURAL") {
      content.push(`TITLE: ${title}\n`);
    }
  }

  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (metaDescMatch && metaDescMatch[1]) {
    const desc = decodeHtml(metaDescMatch[1].trim());
    if (desc) {
      content.push(`DESCRIPTION: ${desc}\n`);
    }
  }

  const textMatches = html.match(/>([^<]+)</g);
  if (textMatches) {
    const textContent = textMatches
      .map(match => {
        const text = match.slice(1, -1).trim();
        return decodeHtml(text);
      })
      .filter(text => {
        if (!text || text.length < 3) return false;
        if (/^[\d\s\W]+$/.test(text)) return false;
        if (text.includes('{"')) return false;
        if (text.includes('function(')) return false;
        if (text.includes('var ')) return false;
        if (text.startsWith('window.')) return false;
        return true;
      })
      .filter((text, index, arr) => arr.indexOf(text) === index);

    if (textContent.length > 0) {
      content.push("\nEXTRACTED TEXT:\n");
      content.push(textContent.join("\n"));
    }
  }

  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatch) {
    for (const script of scriptMatch) {
      const jsonMatch = script.match(/\{[\s\S]*"text"\s*:\s*"([^"]+)"[\s\S]*\}/g);
      if (jsonMatch) {
        for (const json of jsonMatch) {
          try {
            const textMatches = json.match(/"text"\s*:\s*"([^"]+)"/g);
            if (textMatches) {
              const texts = textMatches
                .map(m => m.match(/"text"\s*:\s*"([^"]+)"/)?.[1])
                .filter(t => t && t.length > 2)
                .map(t => decodeHtml(t || ""));

              if (texts.length > 0) {
                content.push("\nFOUND IN DATA:\n");
                content.push(texts.join("\n"));
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  return content.join("\n").trim();
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\/g, "")
    .trim();
}

function countElements(content: string): number {
  const lines = content.split("\n").filter(line => line.trim().length > 0);
  return lines.length;
}