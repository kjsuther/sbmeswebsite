import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import JSZip from "npm:jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function extractTextFromPPTX(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = new JSZip();
  await zip.loadAsync(arrayBuffer);

  let extractedText = "";
  const slideFiles: string[] = [];

  zip.forEach((relativePath: string) => {
    if (relativePath.startsWith("ppt/slides/slide") && relativePath.endsWith(".xml")) {
      slideFiles.push(relativePath);
    }
  });

  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0");
    const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0");
    return numA - numB;
  });

  for (const slideFile of slideFiles) {
    const slideXML = await zip.file(slideFile)?.async("text");
    if (slideXML) {
      const textMatches = slideXML.matchAll(/<a:t>([^<]+)<\/a:t>/g);
      const slideText = Array.from(textMatches)
        .map(match => match[1])
        .join(" ");

      if (slideText.trim()) {
        extractedText += slideText + "\n\n";
      }
    }
  }

  return extractedText.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const extractedText = await extractTextFromPPTX(arrayBuffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "No text could be extracted from PowerPoint",
          text: "",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        text: extractedText,
        metadata: {
          filename: file.name,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error extracting PowerPoint text:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to extract text from PowerPoint",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});