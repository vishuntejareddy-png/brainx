/**
 * AIAnswerPanel — reusable Copilot answer display.
 *
 * Built for the Knowledge Copilot page.
 * Not used on Dashboard — imported on CopilotPage only.
 *
 * Structure:
 *   Question header
 *   → AI Answer (main prose block)
 *   → Evidence (bullet list with source citations)
 *   → Recommendation (amber-tinted highlighted card)
 *   → Sources (font-mono chips)
 */

interface Evidence {
  id: string;
  text: string;
  source: string;
}

interface AIAnswerPanelProps {
  question: string;
  answer: string;
  evidence: Evidence[];
  recommendation: string;
  sources: string[];
}

export function AIAnswerPanel({
  question,
  answer,
  evidence,
  recommendation,
  sources,
}: AIAnswerPanelProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5">
      {/* Question */}
      <div>
        <p className="text-caption font-sans text-neutral-500 uppercase tracking-wide mb-1">
          Question
        </p>
        <h2 className="text-h3 font-sans font-medium text-neutral-900">{question}</h2>
      </div>

      <hr className="border-neutral-100" />

      {/* AI Answer */}
      <div>
        <p className="text-caption font-sans text-neutral-500 uppercase tracking-wide mb-2">
          AI Answer
        </p>
        <p className="text-body font-sans text-neutral-800 leading-relaxed">{answer}</p>
      </div>

      {/* Evidence */}
      {evidence.length > 0 && (
        <div>
          <p className="text-caption font-sans text-neutral-500 uppercase tracking-wide mb-2">
            Evidence
          </p>
          <ul className="space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="flex gap-2 text-body font-sans text-neutral-700">
                <span className="text-neutral-300 select-none">—</span>
                <span>
                  {e.text}{" "}
                  <span className="font-mono text-data text-neutral-500">{e.source}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-caption font-sans text-amber-700 uppercase tracking-wide mb-1">
          Recommendation
        </p>
        <p className="text-body font-sans text-amber-900">{recommendation}</p>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div>
          <p className="text-caption font-sans text-neutral-500 uppercase tracking-wide mb-2">
            Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {sources.map((src) => (
              <span
                key={src}
                className="font-mono text-data text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md"
              >
                {src}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
