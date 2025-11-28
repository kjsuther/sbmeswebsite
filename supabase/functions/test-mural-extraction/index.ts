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
    const { url }: ExtractionRequest = await req.json();

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

    const extractedContent = await extractWithBrowserless(url);

    const hasContent = extractedContent && extractedContent.trim().length > 100;

    const result: ExtractionResponse = {
      success: hasContent,
      content: extractedContent,
      error: hasContent ? undefined : "Could not extract content from Mural board. The board may be inaccessible or requires authentication.",
      metadata: {
        elementsFound: countElements(extractedContent),
        processingTime: Date.now() - startTime,
        extractionMethod: "browser-automation",
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

async function extractWithBrowserless(url: string): Promise<string> {
  try {
    const browserlessUrl = "https://chrome.browserless.io/content";
    const browserlessToken = Deno.env.get("BROWSERLESS_TOKEN");

    if (!browserlessToken) {
      throw new Error("Browser automation is not configured. BROWSERLESS_TOKEN is missing.");
    }

    const response = await fetch(`${browserlessUrl}?token=${browserlessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        gotoOptions: {
          waitUntil: "networkidle2",
          timeout: 30000,
        },
        addScriptTag: [
          {
            content: `
              (async () => {
                await new Promise(resolve => setTimeout(resolve, 3000));

                const buttons = Array.from(document.querySelectorAll('button, a, [role=\"button\"]'));
                for (const button of buttons) {
                  const text = button.textContent || button.getAttribute('aria-label') || '';
                  if (text.toLowerCase().includes('enter') && text.toLowerCase().includes('visitor')) {
                    button.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                  }
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
              })();
            `,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Browserless API error: ${response.status} - ${errorText}`);
    }

    const html = await response.text();

    const extractedTexts = new Set<string>();

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;

    const textMatches = bodyContent.match(/>([^<]+)</g);
    if (textMatches) {
      textMatches.forEach((match) => {
        const text = match.slice(1, -1).trim();
        if (text && text.length > 2) {
          if (!/^[\d\s\W]+$/.test(text) &&
              !text.includes('function(') &&
              !text.includes('var ') &&
              !text.startsWith('window.') &&
              !text.startsWith('{') &&
              !text.startsWith('[')) {
            extractedTexts.add(text);
          }
        }
      });
    }

    const dataAttributeMatches = bodyContent.match(/(?:data-text|aria-label|title)=["']([^"']+)["']/gi);
    if (dataAttributeMatches) {
      dataAttributeMatches.forEach((match) => {
        const valueMatch = match.match(/=["']([^"']+)["']/);
        if (valueMatch && valueMatch[1]) {
          const text = decodeHtml(valueMatch[1]).trim();
          if (text && text.length > 2) {
            extractedTexts.add(text);
          }
        }
      });
    }

    if (extractedTexts.size === 0) {
      return "No content could be extracted. The Mural board may require authentication or have restricted access.";
    }

    return Array.from(extractedTexts).join('\n');

  } catch (error) {
    console.error('Browser automation extraction error:', error);

    if (error instanceof Error && error.message.includes('BROWSERLESS_TOKEN')) {
      throw new Error(
        "Browser automation requires a Browserless.io account. " +
        "Please configure BROWSERLESS_TOKEN environment variable or use manual content entry. " +
        "Visit https://browserless.io to get a free API token."
      );
    }

    throw error;
  }
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