import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import { convertGitHubUrl, validateGitHubUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content } = body as { url?: string; content?: string };

    if (!url && !content) {
      return NextResponse.json(
        { success: false, error: "Please provide a GitHub URL or file content." },
        { status: 400 }
      );
    }

    let fileContent: string;

    if (url) {
      if (!validateGitHubUrl(url)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid GitHub URL." },
          { status: 400 }
        );
      }

      const rawUrl = convertGitHubUrl(url);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(rawUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          if (response.status === 404) {
            return NextResponse.json(
              { success: false, error: "File not found. Check the URL and make sure the file exists." },
              { status: 404 }
            );
          }
          return NextResponse.json(
            { success: false, error: `Failed to fetch file (HTTP ${response.status}).` },
            { status: 502 }
          );
        }

        fileContent = await response.text();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return NextResponse.json(
            { success: false, error: "Request timed out. The file may be too large or the server is slow." },
            { status: 504 }
          );
        }
        return NextResponse.json(
          { success: false, error: "Network error. Could not reach GitHub." },
          { status: 502 }
        );
      }
    } else {
      fileContent = content as string;
    }

    if (fileContent.length > 500_000) {
      return NextResponse.json(
        { success: false, error: "File is too large (max 500KB)." },
        { status: 413 }
      );
    }

    const result = runAudit(fileContent);

    return NextResponse.json({ success: true, result });
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
