import { NextRequest, NextResponse } from "next/server";
import { createAIProvider, LocalAIProvider } from "@/lib/ai/provider";
import { Project } from "@/types/project";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, idea, questionId, answer, project } = body;

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project object is required" },
        { status: 400 }
      );
    }

    const provider = createAIProvider();

    if (action === "analyze_idea") {
      if (!idea) {
        return NextResponse.json(
          { success: false, error: "Idea is required for analyze_idea" },
          { status: 400 }
        );
      }
      const result = await provider.analyzeIdea(idea, project);
      return NextResponse.json({ success: true, data: result, provider: "local" });
    }

    if (action === "analyze_answer") {
      if (!questionId) {
        return NextResponse.json(
          { success: false, error: "questionId is required for analyze_answer" },
          { status: 400 }
        );
      }
      const result = await provider.analyzeAnswer(questionId, answer, project);
      return NextResponse.json({ success: true, data: result, provider: "local" });
    }

    if (action === "generate_prd") {
      const prd = await provider.generatePRD(project);
      return NextResponse.json({ success: true, data: prd, provider: "local" });
    }

    if (action === "generate_summary") {
      const summary = await provider.generateSummary(project);
      return NextResponse.json({ success: true, data: summary, provider: "local" });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("AI Route Error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
