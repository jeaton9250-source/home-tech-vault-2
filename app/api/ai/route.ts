import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `You are Home Tech AI. Answer this question clearly: ${question}`,
    });

    return NextResponse.json({
      answer: response.output_text,
    });
  } catch (error: any) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      {
        answer: "AI error: " + (error?.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}