"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { marked } from "marked";
import { useEffect, useCallback, useRef, useState, memo } from "react";

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  height?: string;
  maxLength?: number;
}

interface ToolbarProps {
  editor: Editor;
}

function cleanHtmlContent(htmlContent: string): string {
  return htmlContent
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function convertHtmlToMarkdown(html: string): string {
  let markdown = html;

  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_: string, listContent: string) => {
    const liMatches = listContent.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const items = liMatches
      .map((li: string) => {
        const contentMatch = li.match(/<li[^>]*>([\s\S]*?)<\/li>/i);
        return contentMatch ? cleanHtmlContent(contentMatch[1]) : "";
      })
      .filter((item: string) => item);

    return "\n" + items.map((item: string, index: number) => `${index + 1}. ${item}`).join("\n") + "\n\n";
  });

  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_: string, listContent: string) => {
    const liMatches = listContent.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const items = liMatches
      .map((li: string) => {
        const contentMatch = li.match(/<li[^>]*>([\s\S]*?)<\/li>/i);
        return contentMatch ? cleanHtmlContent(contentMatch[1]) : "";
      })
      .filter((item: string) => item);

    return "\n" + items.map((item: string) => `- ${item}`).join("\n") + "\n\n";
  });

  markdown = markdown.replace(/<\/?ul[^>]*>/gi, "\n");

  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, pContent) => {
    let cleanContent = pContent
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (cleanContent.length === 0) return "";
    return cleanContent + "\n\n";
  });

  markdown = markdown.replace(/<br\s*\/?>/g, "\n");
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/gs, "**$1**");
  markdown = markdown.replace(/<b>(.*?)<\/b>/gs, "**$1**");
  markdown = markdown.replace(/<em>(.*?)<\/em>/gs, "*$1*");
  markdown = markdown.replace(/<i>(.*?)<\/i>/gs, "*$1*");
  markdown = markdown.replace(/<code>(.*?)<\/code>/gs, "`$1`");
  markdown = markdown.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n");
  markdown = markdown.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n");
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n");
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n");
  markdown = markdown.replace(/<hr\s*\/?>/gi, "\n---\n\n");
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, "![$2]($1)");
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, "![]($1)");
  markdown = markdown.replace(/<[^>]+>/g, "");
  markdown = markdown.replace(/&nbsp;/g, " ");
  markdown = markdown.replace(/&amp;/g, "&");
  markdown = markdown.replace(/&lt;/g, "<");
  markdown = markdown.replace(/&gt;/g, ">");
  markdown = markdown.replace(/&quot;/g, '"');

  markdown = markdown.replace(/\n{3,}/g, "\n\n");

  return markdown.trim();
}

const Toolbar = memo<ToolbarProps>(({ editor }) => {
  const handleSetLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleAddImage = useCallback(() => {
    const url = window.prompt("Image URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const toggleBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor]);
  const toggleStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor]);
  const toggleH1 = useCallback(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), [editor]);
  const toggleH2 = useCallback(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), [editor]);
  const toggleH3 = useCallback(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), [editor]);
  const toggleBulletList = useCallback(() => editor.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor.chain().focus().toggleOrderedList().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleCodeBlock = useCallback(() => editor.chain().focus().toggleCodeBlock().run(), [editor]);
  const toggleCode = useCallback(() => editor.chain().focus().toggleCode().run(), [editor]);
  const setHorizontalRule = useCallback(() => editor.chain().focus().setHorizontalRule().run(), [editor]);
  const undo = useCallback(() => editor.chain().focus().undo().run(), [editor]);
  const redo = useCallback(() => editor.chain().focus().redo().run(), [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
      <button
        type="button"
        onClick={toggleBold}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("bold") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Bold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={toggleItalic}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("italic") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Italic"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 4v16m-4 0h4" />
        </svg>
      </button>

      <button
        type="button"
        onClick={toggleStrike}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("strike") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Strikethrough"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 12v-4M4 12h16" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={toggleH1}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Heading 1"
      >
        <span className="font-bold text-sm">H1</span>
      </button>

      <button
        type="button"
        onClick={toggleH2}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Heading 2"
      >
        <span className="font-bold text-sm">H2</span>
      </button>

      <button
        type="button"
        onClick={toggleH3}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("heading", { level: 3 }) ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Heading 3"
      >
        <span className="font-bold text-sm">H3</span>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={toggleBulletList}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("bulletList") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Bullet List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <button
        type="button"
        onClick={toggleOrderedList}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("orderedList") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Ordered List"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M4 8h.01M4 12h.01M4 16h.01" />
        </svg>
      </button>

      <button
        type="button"
        onClick={toggleBlockquote}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("blockquote") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Blockquote"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={toggleCodeBlock}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("codeBlock") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Code Block"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={handleSetLink}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("link") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Add Link"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleAddImage}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
        title="Add Image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={toggleCode}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive("code") ? "bg-gray-200 text-red-600" : "text-gray-700"
        }`}
        title="Inline Code"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16" />
        </svg>
      </button>

      <button
        type="button"
        onClick={setHorizontalRule}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
        title="Horizontal Rule"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
        </svg>
      </button>

      <button
        type="button"
        onClick={undo}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-40"
        title="Undo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={redo}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-40"
        title="Redo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
      </button>
    </div>
  );
}, (prevProps, nextProps) => prevProps.editor === nextProps.editor);

Toolbar.displayName = "Toolbar";

const OverLimitWarning = memo<{ maxLength: number }>(({ maxLength }) => (
  <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600">
    Character limit exceeded ({maxLength.toLocaleString()} max). Please remove some content.
  </div>
));

OverLimitWarning.displayName = "OverLimitWarning";

export const TiptapEditor = memo(function TiptapEditor({ content, onContentChange, height = "500px", maxLength = 20000 }: TiptapEditorProps) {
  const isInitialContentSet = useRef(false);
  const isInternalUpdate = useRef(false);
  const previousContent = useRef<string | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-100 p-4 rounded-lg font-mono text-sm",
          },
        },
        link: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog content...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      const markdown = convertHtmlToMarkdown(html);

      if (markdown.length > maxLength) {
        setIsOverLimit(true);
        const truncatedMarkdown = markdown.slice(0, maxLength);
        const truncatedHtml = marked.parse(truncatedMarkdown) as string;
        editor.commands.setContent(truncatedHtml);
        onContentChange(truncatedMarkdown);
        setTimeout(() => {
          isInternalUpdate.current = false;
        }, 0);
        return;
      }

      setIsOverLimit(false);
      onContentChange(markdown);
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
  });

  useEffect(() => {
    if (!editor || isInitialContentSet.current) return;

    isInitialContentSet.current = true;
    if (!content) {
      editor.commands.clearContent();
      return;
    }

    if (content.trim().startsWith("<")) {
      editor.commands.setContent(content);
    } else {
      try {
        const htmlContent = marked.parse(content) as string;
        editor.commands.setContent(htmlContent || content);
      } catch (error) {
        console.error("Failed to parse markdown:", error);
        editor.commands.setContent(content);
      }
    }
    previousContent.current = content;
  }, [editor]);

  useEffect(() => {
    if (!editor || isInternalUpdate.current) return;
    if (previousContent.current === content) return;
    if (!isInitialContentSet.current) return;

    previousContent.current = content;
    if (!content) {
      editor.commands.clearContent();
      return;
    }

    if (content.trim().startsWith("<")) {
      editor.commands.setContent(content);
    } else {
      try {
        const htmlContent = marked.parse(content) as string;
        editor.commands.setContent(htmlContent || content);
      } catch (error) {
        console.error("Failed to parse markdown:", error);
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height }}>
      <Toolbar editor={editor} />

      {isOverLimit && <OverLimitWarning maxLength={maxLength} />}

      <div className="prose prose-sm max-w-none p-4 overflow-y-auto" style={{ height: `calc(${height} - ${isOverLimit ? 84 : 52}px)` }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

TiptapEditor.displayName = "TiptapEditor";
