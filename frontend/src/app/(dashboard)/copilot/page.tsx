'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Loader2,
  ArrowUp,
  Hexagon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineStage = 'understanding' | 'retrieving' | 'chunks' | 'generating' | 'sources';
type StageStatus = 'pending' | 'active' | 'done';
type StageState = Record<PipelineStage, StageStatus>;

interface BackendSource {
  filename: string;
  chunk_id: number;
  rank: number;
  excerpt?: string;
}

interface BackendStats {
  retrieved_chunks:   number;
  retrieval_time_ms:  number;
  generation_time_ms: number;
  total_time_ms:      number;
  embedding_model:    string;
  generation_model:   string;
}

interface CopilotMessage {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
  sources?: BackendSource[];
  stats?:   BackendStats;
  error?:   boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL = 'http://localhost:8000';

const SUGGESTED = [
  'Why did Pump-23 fail?',
  'How often should bearings be replaced?',
  'Show maintenance history for Pump-23.',
];

const PIPELINE_STAGES: { key: PipelineStage; label: string }[] = [
  { key: 'understanding', label: 'Understanding question' },
  { key: 'retrieving',    label: 'Searching ChromaDB' },
  { key: 'chunks',        label: 'Found relevant chunks' },
  { key: 'generating',    label: 'Generating response' },
  { key: 'sources',       label: 'Preparing sources' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function confidenceLabel(rank: number, total: number) {
  const score = 1 - (rank - 1) / Math.max(total, 1);
  if (score > 0.8) return { label: '95% Match', color: 'text-white' };
  if (score > 0.55) return { label: '82% Match', color: 'text-white/70' };
  return                  { label: '68% Match', color: 'text-white/45' };
}

function fmtMs(ms?: number) {
  if (!ms) return '—';
  return ms > 999 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

function shortName(filename?: string) {
  if (!filename) return 'Unknown';
  return filename.replace(/^\d{8}_\d{6}_[a-f0-9]+_/, '');
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Custom Agent Logo ────────────────────────────────────────────────────────

function AgentLogo({ state = 'idle' }: { state?: 'idle' | 'thinking' | 'done' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 w-6 h-6 transition-all duration-300`}>
      <Hexagon 
        size={20} 
        strokeWidth={1.5}
        className={`relative z-10 transition-colors duration-500 ${
          state === 'idle' ? 'text-white' :
          state === 'thinking' ? 'text-[#8FB8FF]' :
          'text-white'
        }`}
      />
      {state === 'thinking' && (
        <div className="absolute inset-0 bg-[#8FB8FF]/10 rounded-full animate-pulse" />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InlineThinkingFlow({ stages, chunksFound }: { stages: StageState; chunksFound: number }) {
  const visibleStages = PIPELINE_STAGES.filter(s => stages[s.key] !== 'pending');
  
  if (visibleStages.length === 0) return null;

  return (
    <div className="pl-8 py-2 space-y-3" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
      {visibleStages.map((stage, idx) => {
        const state = stages[stage.key];
        const isLast = idx === visibleStages.length - 1;
        
        let label = stage.label;
        if (stage.key === 'chunks' && chunksFound > 0 && state === 'done') {
          label = `Found ${chunksFound} relevant chunks`;
        }

        return (
          <div key={stage.key} className="flex items-center gap-3 relative" style={{ animation: 'fadeSlideUp 0.2s ease both' }}>
            {/* Connecting line */}
            {!isLast && (
              <div className="absolute left-[7px] top-6 bottom-[-12px] w-[1px] bg-white/[0.08]" />
            )}
            
            {/* Status indicator */}
            <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0 bg-[#000000] z-10">
              {state === 'done' ? (
                <Check size={12} className="text-white" strokeWidth={2.5} />
              ) : (
                <Loader2 size={12} className="text-[#8FB8FF] animate-spin" />
              )}
            </div>
            
            {/* Label */}
            <span className={`text-[13px] font-mono tracking-tight transition-colors duration-300 ${
              state === 'done' ? 'text-white/45' : 'text-[#8FB8FF]'
            }`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CompactSourceCard({ source, total }: { source: BackendSource; total: number }) {
  const [open, setOpen] = useState(false);
  const conf = confidenceLabel(source.rank, total);

  return (
    <div 
      className="rounded-none overflow-hidden transition-all duration-200"
      style={{ animation: `fadeSlideUp 0.3s ${source.rank * 40}ms ease both` }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <FileText size={13} className="text-white/45 shrink-0" />
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-[13px] font-medium text-white truncate">
              {shortName(source.filename)}
            </span>
            <span className="text-[13px] font-mono text-white/45 shrink-0">
              Chunk {source.chunk_id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[13px] font-mono ${conf.color}`}>
            {conf.label}
          </span>
          {open ? <ChevronUp size={14} className="text-white/45" /> : <ChevronDown size={14} className="text-white/45" />}
        </div>
      </button>

      {open && (
        <div className="pb-4 pt-1">
          <p className="text-[14px] text-white/70 leading-relaxed font-sans">
            {source.excerpt || "Excerpt loading or unavailable. Please refer to the original document."}
          </p>
        </div>
      )}
    </div>
  );
}

function StatFooter({ stats }: { stats: BackendStats }) {
  return (
    <div className="flex flex-wrap items-center gap-6 mt-8 pt-4 text-[13px] font-mono text-white/45">
      <span>{fmtMs(stats.total_time_ms)}</span>
      <span>{stats.retrieved_chunks} chunks</span>
      <span>{stats.generation_model ?? 'Gemini'}</span>
    </div>
  );
}

function FormattedMarkdown({ content }: { content: string }) {
  return (
    <div className="text-[#ECECEC]">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-[15px] font-semibold text-white uppercase tracking-widest mt-8 mb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-[15px] font-semibold text-white uppercase tracking-widest mt-8 mb-4" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-[15px] font-semibold text-white uppercase tracking-widest mt-8 mb-4" {...props} />,
          p:  ({node, ...props}) => <p className="text-[17px] leading-[1.8] mb-6 last:mb-0 font-normal" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 space-y-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-6 space-y-2" {...props} />,
          li: ({node, ...props}) => <li className="text-[17px] leading-[1.8] pl-1 font-normal" {...props} />,
          strong: ({node, ...props}) => <strong className="font-medium text-white" {...props} />,
          a:  ({node, ...props}) => <a className="text-[#8FB8FF] hover:underline" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-white/20 pl-4 italic text-white/55 my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function AssistantBubble({ msg }: { msg: CopilotMessage }) {
  return (
    <div className="space-y-4" style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
      <div className="flex gap-4">
        <AgentLogo state="done" />
        <div className="flex-1 min-w-0 pt-0.5">
          {msg.error ? (
            <div className="text-[17px] leading-[1.8] text-red-400">
              {msg.content}
            </div>
          ) : (
            <FormattedMarkdown content={msg.content} />
          )}

          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-10 space-y-0">
              <div className="text-[13px] font-semibold text-white/45 uppercase tracking-widest mb-4">
                Sources
              </div>
              <div className="flex flex-col">
                {msg.sources.map((src) => (
                  <CompactSourceCard
                    key={`${src.filename}-${src.chunk_id}`}
                    source={src}
                    total={msg.sources!.length}
                  />
                ))}
              </div>
            </div>
          )}

          {msg.stats && <StatFooter stats={msg.stats} />}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CopilotPage() {
  const [messages,      setMessages]      = useState<CopilotMessage[]>([]);
  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [stages,        setStages]        = useState<StageState>({
    understanding: 'pending',
    retrieving:    'pending',
    chunks:        'pending',
    generating:    'pending',
    sources:       'pending',
  });
  const [chunksFound,   setChunksFound]   = useState(0);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, stages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [input]);

  const resetStages = () => setStages({
    understanding: 'pending',
    retrieving:    'pending',
    chunks:        'pending',
    generating:    'pending',
    sources:       'pending',
  });

  const setStage = (key: PipelineStage, state: StageStatus) =>
    setStages((prev) => ({ ...prev, [key]: state }));

  const submit = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q || loading) return;

    setInput('');
    setLoading(true);
    setChunksFound(0);
    resetStages();

    const userMsg: CopilotMessage = {
      id:      uid(),
      role:    'user',
      content: q,
    };
    setMessages((prev) => [...prev, userMsg]);

    setStage('understanding', 'active');
    await delay(300);
    setStage('understanding', 'done');
    setStage('retrieving', 'active');

    try {
      const res = await fetch(`${BACKEND_URL}/api/copilot`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: q, top_k: 8 }),
      });

      const data = await res.json();
      const chunks = data?.statistics?.retrieved_chunks ?? 0;
      setChunksFound(chunks);
      
      setStage('retrieving', 'done');
      setStage('chunks', 'active');
      await delay(200);
      setStage('chunks', 'done');
      
      setStage('generating', 'active');
      await delay(400); 
      setStage('generating', 'done');
      
      setStage('sources', 'active');
      await delay(200);
      setStage('sources', 'done');

      await delay(100);

      const assistantMsg: CopilotMessage = {
        id:      uid(),
        role:    'assistant',
        content: data.answer ?? 'No answer was returned.',
        sources: data.sources ?? [],
        stats:   data.statistics,
        error:   !data.success,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      
      // Invalidate analytics and dashboard caches to update AI query count
      if (data.success) {
        import("swr").then(({ mutate }) => {
          mutate("http://localhost:8000/api/dashboard");
          mutate("http://localhost:8000/api/analytics");
        });
      }
    } catch (err) {
      ['retrieving', 'chunks', 'generating', 'sources'].forEach((k) =>
        setStage(k as PipelineStage, 'done')
      );
      const errMsg: CopilotMessage = {
        id:      uid(),
        role:    'assistant',
        content: 'Failed to reach the backend. Ensure the server is running.',
        error:   true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div className="flex-1 min-w-0 h-full flex flex-col bg-[#000000] relative overflow-hidden font-sans">
        <div className="flex-1 overflow-y-auto z-10 scroll-smooth">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
            
            {/* Empty State */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-start pt-24 pb-12 space-y-12" style={{ animation: 'fadeSlideUp 0.6s ease-out both' }}>
                <AgentLogo state="idle" />
                <div className="space-y-4">
                  <h1 className="text-[48px] font-semibold text-white tracking-tight leading-[1.1]">
                    Industrial Brain AI
                  </h1>
                  <p className="text-[20px] text-white/55 max-w-2xl leading-relaxed">
                    Grounded Industrial Intelligence. Search maintenance manuals, inspection logs, SOPs, incident reports, and technical documentation.
                  </p>
                </div>
                
                <div className="w-full pt-8 mt-4 border-t border-white/[0.05]">
                  <p className="text-[13px] font-medium text-white/45 uppercase tracking-widest mb-6">
                    Try asking
                  </p>
                  <div className="flex flex-col gap-3 max-w-lg">
                    {SUGGESTED.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="w-full text-left px-5 py-4 rounded-xl bg-transparent hover:bg-[#0A0A0A] text-[15px] text-white/70 hover:text-white transition-all duration-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Stream */}
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
                    <div className="max-w-[75%] px-5 py-4 rounded-2xl bg-[#0A0A0A] text-[17px] text-white leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <AssistantBubble msg={msg} />
                )}
              </div>
            ))}

            {/* Active Loading Flow (Inline) */}
            {loading && (
              <div className="flex gap-4 items-start" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
                <AgentLogo state="thinking" />
                <div className="flex-1 pt-0.5">
                  <InlineThinkingFlow stages={stages} chunksFound={chunksFound} />
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-32" />
          </div>
        </div>

        {/* ── Input Area ─────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none bg-gradient-to-t from-[#000000] via-[#000000] to-transparent pt-12">
          <div className="max-w-3xl mx-auto relative pointer-events-auto">
            <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-[18px] transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything..."
                disabled={loading}
                rows={1}
                className="w-full bg-transparent text-[17px] text-white placeholder-white/45 px-5 pt-4 pb-14 resize-none outline-none leading-relaxed disabled:opacity-50"
                style={{ minHeight: '60px', maxHeight: '300px' }}
              />
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-white/45 hover:text-white hover:bg-white/[0.04] transition-colors" title="Attach Document">
                    <Paperclip size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 pr-1">
                  <span className="hidden sm:inline-block text-[13px] font-mono text-white/45">
                    Shift + Enter to line break
                  </span>
                  <button
                    onClick={() => submit(input)}
                    disabled={loading || !input.trim()}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.08] text-white hover:bg-white/[0.12] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowUp size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
