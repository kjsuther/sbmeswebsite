import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

    let extractedText = "";
    const sheetNames = workbook.SheetNames;
    let totalRows = 0;
    let totalCells = 0;

    sheetNames.forEach((sheetName, sheetIndex) => {
      const sheet = workbook.Sheets[sheetName];

      if (sheetNames.length > 1) {
        extractedText += `\n\n=== Sheet ${sheetIndex + 1}: ${sheetName} ===\n\n`;
      }

      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        blankrows: false
      }) as any[][];

      if (jsonData.length === 0) {
        extractedText += "(Empty sheet)\n";
        return;
      }

      const hasHeaders = jsonData.length > 0 && jsonData[0].some((cell: any) =>
        typeof cell === 'string' && cell.trim().length > 0
      );

      if (hasHeaders) {
        const headers = jsonData[0].map((cell: any) => String(cell || "").trim()).filter(h => h);
        if (headers.length > 0) {
          extractedText += `Column Headers: ${headers.join(", ")}\n\n`;
        }
      }

      const dataStartIndex = hasHeaders ? 1 : 0;
      const dataRows = jsonData.slice(dataStartIndex);

      dataRows.forEach((row: any[], rowIndex: number) => {
        const rowData = row.map((cell: any) => {
          if (cell === null || cell === undefined || cell === "") return "";
          if (typeof cell === 'number') return cell.toString();
          return String(cell).trim();
        }).filter(cell => cell !== "");

        if (rowData.length > 0) {
          extractedText += `Row ${rowIndex + 1}: ${rowData.join(", ")}\n`;
          totalRows++;
          totalCells += rowData.length;
        }
      });
    });

    if (!extractedText || extractedText.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "No text could be extracted from Excel file",
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
        text: extractedText.trim(),
        metadata: {
          filename: file.name,
          sheetCount: sheetNames.length,
          sheetNames: sheetNames,
          totalRows: totalRows,
          totalCells: totalCells,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error extracting Excel text:", error);
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorDetails);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return new Response(
      JSON.stringify({
        error: "Failed to extract text from Excel file",
        details: errorDetails,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});