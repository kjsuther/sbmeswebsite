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

    const hasContent = extractedContent && extractedContent.trim().length > 50;

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
    const browserlessUrl = "https://chrome.browserless.io/function";
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
        code: `
          export default async ({ page }) => {
            await page.goto('${url}', { waitUntil: 'networkidle2', timeout: 45000 });

            await page.waitForTimeout(3000);

            // Click "Enter as visitor" button
            try {
              const buttons = await page.$$('button, a, [role="button"]');
              for (const button of buttons) {
                const text = await page.evaluate(el => el.textContent || el.getAttribute('aria-label') || '', button);
                if (text.toLowerCase().includes('enter') && text.toLowerCase().includes('visitor')) {
                  await button.click();
                  await page.waitForTimeout(5000);
                  break;
                }
              }
            } catch (e) {
              console.log('Visitor button not found or already in visitor mode');
            }

            // Wait for content to load
            await page.waitForTimeout(10000);

            // Extract all visible text content
            const extractedTexts = await page.evaluate(() => {
              const texts = new Set();

              // Get all text from SVG text elements (Mural often uses SVG)
              document.querySelectorAll('text, tspan').forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 2) {
                  texts.add(text);
                }
              });

              // Get text from regular HTML elements
              document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th').forEach(el => {
                // Only get direct text content, not nested
                const clone = el.cloneNode(true);
                Array.from(clone.children).forEach(child => child.remove());
                const text = clone.textContent?.trim();
                if (text && text.length > 2) {
                  texts.add(text);
                }
              });

              // Look for data attributes that might contain text
              document.querySelectorAll('[data-text], [data-content], [aria-label]').forEach(el => {
                const dataText = el.getAttribute('data-text') || el.getAttribute('data-content') || el.getAttribute('aria-label');
                if (dataText && dataText.trim().length > 2) {
                  texts.add(dataText.trim());
                }
              });

              return Array.from(texts);
            });

            return { extractedTexts };
          };
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Browserless API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const extractedTexts = result.extractedTexts || [];

    const uiElementsToRemove = [
      "Go to Canvas",
      "Go to Shortcuts",
      "Go to Navigation Controls",
      "Unlock additional collaboration features",
      "Log in",
      "Sign up for free",
      "Create an account",
      "Enter as a visitor",
      "Skip Links",
      "Canvas Tools",
      "Getting Started",
      "Add objects",
      "Move around",
      "Voting",
      "Present",
      "Comments",
      "Help",
      "Profile and account",
      "Nothing to undo",
      "Nothing to redo",
      "Move mode",
      "Navigation settings",
      "Map",
      "Focus mode",
      "Mural home page",
      "Reactions",
      "Next",
      "navigation",
      "MiniMap",
      "Show more sessions",
      "Close",
      "utilities",
      "Go to the signup page",
      "Edit Mural title",
      "mural-actions",
      "secondary-actions",
      "Mural Right Sidebar",
      "reaction-tools-collaborators",
      "Visiting Rabbit",
      "Visiting Shark",
      "Paste links and files",
      "you're using a trackpad",
      "Hello, have a question",
      "Let's chat",
    ];

    const filteredTexts = extractedTexts.filter((line: string) => {
      if (line.length < 3) return false;
      if (uiElementsToRemove.some(ui => line.toLowerCase().includes(ui.toLowerCase()))) return false;
      if (line.match(/^Zoom (out|in) \(CTRL[+-]\)/)) return false;
      if (line.match(/^Mural (canvas|Notification Bar|Top Bar|options|Sidebar|Bottom Panel|Right Column|Reconnecting Overlay|Bottom Bar)/i)) return false;
      if (line.match(/^(Templates|Sticky notes|Text|Shapes and connectors|Icons|Images|More tools)$/)) return false;
      if (line.match(/^Users, \d+ members$/)) return false;
      if (line.match(/Collaborate with .* and \d+ others/)) return false;
      if (line.match(/^Visiting \w+$/)) return false;
      if (line.match(/^(Hello, have a question|Let's chat)\.?$/)) return false;
      if (line.match(/Press enter to begin editing/i)) return false;
      if (line.match(/Double-click on the canvas/i)) return false;
      if (line.match(/Drag (text|and drop)/i)) return false;
      if (line.match(/Use your mouse to zoom/i)) return false;
      if (line.match(/Click and drag to move/i)) return false;
      if (line.match(/Check Zoom Settings/i)) return false;
      if (line.match(/^&lt;\d+%$/)) return false;
      if (line.match(/^<\d+%$/)) return false;
      if (line.match(/^\d+$/)) return false;
      if (line.includes('function(') || line.includes('var ')) return false;
      if (line.startsWith('window.') || line.startsWith('document.')) return false;
      if (line.endsWith(' options')) return false;
      // Filter out common UI element IDs and classes
      if (line.match(/^(mural|mrl|skiplink|tooltip|button|container|sidebar|topbar|bottombar|modal|portal|separator|vertical|horizontal|dialog|menu|dropdown|widget|placeholder|scrollbar|live-region|focus-mode|zoom|undo|redo|avatar|member|brand|chevron|sticky|template|shapes|image|paste|mouse|drag|settings|iframe|visitor|brandSymbol|brandWordmark)[-_]?\w*$/i)) return false;
      if (line.match(/^(true|false|auto|info|page|generic|assertive|separator|menu|dialog|sidebar)$/i)) return false;
      return true;
    });

    if (filteredTexts.length === 0) {
      return "No meaningful content could be extracted from the Mural board.";
    }

    return filteredTexts.join('\n');

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

function countElements(content: string): number {
  const lines = content.split("\n").filter(line => line.trim().length > 0);
  return lines.length;
}
