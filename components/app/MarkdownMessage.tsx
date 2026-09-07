import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Agent replies come back as markdown (bold, lists, the occasional link or
// quote) — react-markdown's own defaults are unstyled, so every element it
// can produce gets mapped onto jazzlogs' own type scale/palette here instead
// of leaking browser-default styling into the chat.
export default function MarkdownMessage({ text }: { text: string }) {
  return (
    <div className="text-[15.5px] leading-[1.7] text-[#e9e6df]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="m-0 mt-3 first:mt-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#e9e6df]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d99b10] underline underline-offset-2 transition-colors hover:text-[#e6a614]"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="m-0 mt-3 flex list-disc flex-col gap-1.5 pl-5 first:mt-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="m-0 mt-3 flex list-decimal flex-col gap-1.5 pl-5 first:mt-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          h1: ({ children }) => (
            <div className="mt-4 text-[20px] leading-[1.2] font-extrabold tracking-[-.02em] text-[#d99b10] first:mt-0">
              {children}
            </div>
          ),
          h2: ({ children }) => (
            <div className="mt-4 text-[17px] leading-[1.2] font-extrabold tracking-[-.02em] text-[#d99b10] first:mt-0">
              {children}
            </div>
          ),
          h3: ({ children }) => (
            <div className="mt-3 text-[15px] leading-[1.2] font-bold text-[#d99b10] first:mt-0">
              {children}
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className="m-0 mt-3 border-l-2 border-[#d99b10] pl-4 italic text-[rgba(233,230,223,.75)] first:mt-0">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = /language-/.test(className ?? "");
            return isBlock ? (
              <code
                className={
                  "block font-[family-name:var(--font-dm-mono)] text-[13px] " +
                  (className ?? "")
                }
              >
                {children}
              </code>
            ) : (
              <code className="rounded bg-[rgba(233,230,223,.1)] px-1.5 py-0.5 font-[family-name:var(--font-dm-mono)] text-[13px]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="m-0 mt-3 overflow-x-auto rounded-lg bg-[rgba(0,0,0,.25)] p-4 first:mt-0">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-4 border-[rgba(233,230,223,.15)]" />,
          table: ({ children }) => (
            <div className="mt-3 overflow-x-auto first:mt-0">
              <table className="w-full border-collapse text-[14px]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-[rgba(233,230,223,.25)] px-2.5 py-2 text-left font-bold text-[#e9e6df]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[rgba(233,230,223,.1)] px-2.5 py-2 align-top">
              {children}
            </td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
