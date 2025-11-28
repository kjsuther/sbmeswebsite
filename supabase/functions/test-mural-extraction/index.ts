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

            await new Promise(resolve => setTimeout(resolve, 3000));

            // Look for visitor name input and fill it
            try {
              const nameInput = await page.$('input[type="text"]');
              if (nameInput) {
                await nameInput.click();
                await nameInput.type('Visitor');
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (e) {
              console.log('No name input found');
            }

            // Look for and click checkbox (privacy agreement)
            try {
              const checkbox = await page.$('input[type="checkbox"]');
              if (checkbox) {
                await checkbox.click();
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (e) {
              console.log('No checkbox found');
            }

            // Click "Continue as visitor" button
            try {
              const buttons = await page.$$('button');
              for (const button of buttons) {
                const text = await page.evaluate(el => el.textContent || '', button);
                if (text.toLowerCase().includes('continue')) {
                  await button.click();
                  console.log('Clicked continue button');
                  await new Promise(resolve => setTimeout(resolve, 5000));
                  break;
                }
              }
            } catch (e) {
              console.log('Could not click continue button:', e);
            }

            // Wait for canvas to load
            try {
              await page.waitForSelector('svg', { timeout: 15000 });
              console.log('SVG canvas found');
            } catch (e) {
              console.log('Canvas elements not found in expected time');
            }

            // Wait for content to render
            await new Promise(resolve => setTimeout(resolve, 10000));

            // Take a screenshot to help debug what's visible
            const screenshot = await page.screenshot({ encoding: 'base64', fullPage: false });

            // Debug: Get page info
            const pageInfo = await page.evaluate(() => {
              return {
                title: document.title,
                url: window.location.href,
                svgCount: document.querySelectorAll('svg').length,
                textElementCount: document.querySelectorAll('svg text').length,
                allElementsCount: document.querySelectorAll('*').length,
                bodyText: document.body.innerText.substring(0, 500)
              };
            });

            console.log('Page info:', JSON.stringify(pageInfo, null, 2));

            // Extract all visible text content
            const extractedTexts = await page.evaluate(() => {
              const texts = new Set();

              // Get ALL text from SVG text elements
              document.querySelectorAll('svg text').forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 0) {
                  texts.add(text);
                }
              });

              // Get ALL tspan elements
              document.querySelectorAll('svg tspan').forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 0) {
                  texts.add(text);
                }
              });

              // Get text from any element with specific data attributes
              document.querySelectorAll('[data-widget-id], [data-id], [class*="widget"], [class*="sticky"]').forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 3) {
                  texts.add(text);
                }
              });

              // Get all contenteditable elements
              document.querySelectorAll('[contenteditable]').forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 0) {
                  texts.add(text);
                }
              });

              // Fallback: Get all text from body
              const allText = document.body.innerText.split('\\n')
                .map(line => line.trim())
                .filter(line => line.length > 2);
              allText.forEach(line => texts.add(line));

              return Array.from(texts);
            });

            return {
              extractedTexts,
              hasScreenshot: !!screenshot,
              pageInfo
            };
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
      "Continue as a visitor",
      "Your visitor display name",
      "By continuing, I agree",
      "Privacy Notice",
      "Collaborator Notice",
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
      "Highlight votes",
      "favorite questions",
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
