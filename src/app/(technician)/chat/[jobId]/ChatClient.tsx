'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, Camera } from 'lucide-react';
import { sendCoPilotMessage } from '@/lib/ai-actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatClient({ 
  jobId, 
  applianceName, 
  issueDescription 
}: { 
  jobId: string; 
  applianceName: string; 
  issueDescription: string;
}) {
  // Inject real DB data directly into the first AI message
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: `In-Visit Co-Pilot active. I see you are working on the ${applianceName}. Do you need diagnostic steps for the reported issue ("${issueDescription}"), or the teardown manual?` 
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // NEW: ON-LOAD BACKGROUND WEBHOOK TRIGGER
  // Fires instantly when this page is opened
  // =========================================================================
  useEffect(() => {
    fetch('https://api.agents.snsihub.ai/webhook-test/32e9cada-8602-42de-9b73-d038b6e1451f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Passing the job context so your webhook knows exactly which job was opened!
      body: JSON.stringify({ 
        event: 'copilot_opened',
        jobId: jobId,
        appliance: applianceName,
        issue: issueDescription
      }),
    })
    .then(() => console.log("Page Open Webhook fired successfully! 🚀"))
    .catch((error) => console.error("Webhook failed:", error));
  }, [jobId, applianceName, issueDescription]);
  // =========================================================================

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    
    const newHistory = [...messages, { role: 'user', text: userMessage }];
    setMessages(newHistory);
    setIsTyping(true);

    const res = await sendCoPilotMessage(
      applianceName, 
      issueDescription, 
      messages, 
      userMessage
    );

    setMessages([...newHistory, { role: 'ai', text: res.text }]);
    setIsTyping(false);
  };

  return (
    <main className="flex flex-col h-screen bg-neutral-50">
      <header className="bg-white px-5 py-4 border-b border-neutral-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/transit/${jobId}`} className="p-2 -ml-2 text-neutral-700 hover:text-black">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <Brain size={16} /> AI Co-Pilot
            </h1>
            <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest mt-0.5">Job #{jobId.slice(-4)}</p>
          </div>
        </div>
        <Link href={`/otp/${jobId}`} className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-black transition-colors">
          <CheckCircle2 size={14} /> Finish Job
        </Link>
      </header>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-neutral-900 text-white rounded-tr-sm' 
                : 'bg-white border border-neutral-100 text-neutral-800 rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                // Render user messages as normal text
                msg.text
              ) : (
                // Render AI messages as styled Markdown
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-base font-bold mt-4 mb-2 text-neutral-900" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-4 mb-2 text-neutral-900" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xs font-bold mt-3 mb-1 text-emerald-800 uppercase tracking-wider" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1.5" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1.5" {...props} />,
                    li: ({node, ...props}) => <li className="leading-snug" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-neutral-900" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-emerald-500 pl-3 italic text-neutral-600 bg-emerald-50/50 py-1.5 pr-2 my-3 rounded-r-lg" {...props} />,
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto mb-4 mt-2 rounded-xl border border-neutral-200">
                        <table className="min-w-full text-left text-xs" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => <th className="bg-neutral-50 p-3 font-bold text-neutral-700 border-b border-neutral-200" {...props} />,
                    td: ({node, ...props}) => <td className="p-3 border-b border-neutral-100 last:border-0" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white border border-neutral-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-200" />
             </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-white border-t border-neutral-100 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button type="button" className="w-12 h-12 rounded-2xl bg-neutral-50 text-neutral-500 border border-neutral-100 flex items-center justify-center shrink-0 hover:bg-neutral-100">
            <Camera size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for diagnostic help..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-neutral-400 text-white rounded-xl disabled:opacity-50 hover:bg-neutral-900 transition-colors"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Brain({ size, className }: { size: number, className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
}