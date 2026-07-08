"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function AIPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    setLoading(true);
    setAnswer("");

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    setAnswer(data.answer || "No answer returned.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title="Home Tech AI"
        description="Ask personalized questions about your devices, subscriptions, documents, and network."
      />

      <div className="bg-white rounded-2xl shadow p-6 mt-8 max-w-4xl">
        <textarea
          className="border rounded-xl p-4 w-full"
          rows={5}
          placeholder="Ask: How healthy is my home technology?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          onClick={askAI}
          disabled={loading || !question}
          className="bg-blue-950 text-white px-6 py-3 rounded-xl mt-4 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask Home Tech AI"}
        </button>

        {answer && (
          <div className="bg-blue-50 rounded-xl p-5 mt-6 whitespace-pre-wrap text-gray-800">
            {answer}
          </div>
        )}
      </div>
    </main>
  );
}