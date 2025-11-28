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
    htmlSize?: number;
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
    const htmlSize = html.length;

    const hasContent = extractedContent && extractedContent.trim().length > 100;

    const result: ExtractionResponse = {
      success: hasContent,
      content: hasContent ? extractedContent : `HTML received (${htmlSize} bytes) but minimal content extracted.\n\n${extractedContent}\n\n---\n\nThis likely means the Mural board uses JavaScript to render content dynamically. The page needs to be executed in a browser to access the actual board data.`,
      error: hasContent ? undefined : "Mural board content is rendered with JavaScript and requires browser automation to extract. Basic HTML parsing cannot access the board data.",
      metadata: {
        elementsFound: countElements(extractedContent),
        processingTime: Date.now() - startTime,
        extractionMethod: "html-parsing",
        htmlSize,
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
  const foundTexts = new Set<string>();

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const title = decodeHtml(titleMatch[1].trim());
    if (title && !title.includes("MURAL") && title !== "MURAL") {
      content.push(`BOARD TITLE: ${title}\n`);
    }
  }

  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (metaDescMatch && metaDescMatch[1]) {
    const desc = decodeHtml(metaDescMatch[1].trim());
    if (desc && desc.length > 10) {
      content.push(`DESCRIPTION: ${desc}\n`);
    }
  }

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch && ogTitleMatch[1]) {
    const ogTitle = decodeHtml(ogTitleMatch[1].trim());
    if (ogTitle && ogTitle.length > 2) {
      content.push(`OG TITLE: ${ogTitle}\n`);
    }
  }

  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatch) {
    for (const script of scriptMatch) {
      const scriptContent = script.replace(/<\/?script[^>]*>/gi, '');

      const jsonObjectMatches = scriptContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
      if (jsonObjectMatches) {
        for (const jsonStr of jsonObjectMatches) {
          try {
            if (jsonStr.includes('"text"') || jsonStr.includes('"content"') ||
                jsonStr.includes('"title"') || jsonStr.includes('"label"')) {

              const textMatches = [
                ...jsonStr.matchAll(/"(?:text|content|title|label|name|description)"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/g)
              ];

              for (const match of textMatches) {
                const text = decodeHtml(match[1] || '').trim();
                if (text && text.length > 2 && !foundTexts.has(text)) {
                  if (!text.includes('function') && !text.includes('window.') &&
                      !text.startsWith('{') && !text.startsWith('[')) {
                    foundTexts.add(text);
                  }
                }
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      const windowDataMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/);
      if (windowDataMatch) {
        try {
          const dataStr = windowDataMatch[1];
          const textMatches = [...dataStr.matchAll(/"(?:text|content|title)"\s*:\s*"([^"]+)"/g)];
          for (const match of textMatches) {
            const text = decodeHtml(match[1]).trim();
            if (text && text.length > 2 && !foundTexts.has(text)) {
              foundTexts.add(text);
            }
          }
        } catch {
          // Skip
        }
      }
    }
  }

  const dataAttributeMatches = html.match(/data-[a-z-]+\s*=\s*["']([^"']{10,})["']/gi);
  if (dataAttributeMatches) {
    for (const match of dataAttributeMatches) {
      const valueMatch = match.match(/=\s*["']([^"']+)["']/);
      if (valueMatch && valueMatch[1]) {
        try {
          const decoded = decodeURIComponent(valueMatch[1]);
          if (decoded.includes('{') || decoded.includes('[')) {
            const textMatches = [...decoded.matchAll(/"(?:text|content|title)"\s*:\s*"([^"]+)"/g)];
            for (const textMatch of textMatches) {
              const text = decodeHtml(textMatch[1]).trim();
              if (text && text.length > 2 && !foundTexts.has(text)) {
                foundTexts.add(text);
              }
            }
          }
        } catch {
          // Skip
        }
      }
    }
  }

  if (foundTexts.size > 0) {
    content.push('\n=== EXTRACTED CONTENT ===\n');
    Array.from(foundTexts).forEach((text, index) => {
      content.push(`${index + 1}. ${text}`);
    });
  }

  const allText = content.join('\n');

  if (allText.trim().length < 50) {
    content.push('\n\n=== DEBUG INFO ===');
    content.push(`HTML Size: ${html.length} bytes`);
    content.push(`Scripts found: ${scriptMatch?.length || 0}`);
    content.push(`Contains __INITIAL_STATE__: ${html.includes('__INITIAL_STATE__')}`);
    content.push(`Contains "mural": ${html.toLowerCase().includes('mural')}`);

    const firstScript = scriptMatch?.[0]?.substring(0, 500);
    if (firstScript) {
      content.push(`\nFirst script preview:\n${firstScript}...`);
    }
  }

  return content.join('\n').trim();
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