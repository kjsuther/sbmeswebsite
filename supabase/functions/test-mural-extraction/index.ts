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
        extractionMethod: "browser-automation-scrape",
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
    const browserlessUrl = "https://chrome.browserless.io/scrape";
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
        elements: [
          {
            selector: "body",
            timeout: 10000,
          }
        ],
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
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    break;
                  }
                }

                await new Promise(resolve => setTimeout(resolve, 8000));
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

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      return "No content could be extracted. The Mural board may require authentication or have restricted access.";
    }

    const scrapedData = result.data[0];
    let extractedText = scrapedData.text || "";

    const uiElementsToRemove = [
      /Go to (Canvas|Shortcuts|Navigation Controls)/gi,
      /Unlock additional collaboration features/gi,
      /Log in/gi,
      /Sign up for free/gi,
      /Press enter to begin editing.*/gi,
      /Add objects/gi,
      /Double-click on the canvas.*/gi,
      /Drag text, shapes.*/gi,
      /Drag and drop images.*/gi,
      /Paste links and files.*/gi,
      /Move around/gi,
      /Use your mouse to zoom/gi,
      /Click and drag to move/gi,
      /Check Zoom Settings.*/gi,
      /Getting Started/gi,
      /Create an account/gi,
      /Enter as a visitor/gi,
      /Skip Links/gi,
      /Mural (canvas|Notification Bar|Top Bar|options|Sidebar|Bottom Panel|Right Column).*/gi,
      /Canvas Tools/gi,
      /Templates/gi,
      /Sticky notes/gi,
      /Text/gi,
      /Shapes and connectors/gi,
      /Icons/gi,
      /Images/gi,
      /More tools/gi,
      /Show more sessions/gi,
      /Close/gi,
      /Voting/gi,
      /Present/gi,
      /Comments/gi,
      /Users, \d+ members/gi,
      /Help/gi,
      /Profile and account/gi,
      /Nothing to (undo|redo)/gi,
      /Move mode/gi,
      /Navigation settings/gi,
      /Map/gi,
      /Zoom (out|in) \(CTRL[+-]\)/gi,
      /Focus mode/gi,
      /Hello, have a question.*/gi,
      /Mural home page/gi,
      /Collaborate with .* and \d+ others/gi,
      /Reactions/gi,
      /Visiting Shark.*/gi,
      /Next/gi,
      /navigation/gi,
      /MiniMap/gi,
      />>>\d+/g,
      />>0\?1:0/g,
      /<<<\d+/g,
    ];

    uiElementsToRemove.forEach(pattern => {
      extractedText = extractedText.replace(pattern, '');
    });

    const lines = extractedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (line.length < 3) return false;
        if (/^[<>&|^~*+\-=()[\]{}:;,."'`]+$/.test(line)) return false;
        if (line.includes('>>>') || line.includes('<<<')) return false;
        if (line.includes('function(') || line.includes('var ')) return false;
        if (line.startsWith('window.') || line.startsWith('document.')) return false;
        if (line.match(/^\d+$/)) return false;
        if (line.match(/^[<>%]+$/)) return false;
        return true;
      });

    const uniqueLines = [...new Set(lines)];

    if (uniqueLines.length === 0) {
      return "No meaningful content could be extracted from the Mural board.";
    }

    return uniqueLines.join('\n');

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