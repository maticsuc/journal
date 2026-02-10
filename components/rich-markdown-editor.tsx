"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
} from "lucide-react";
import { useEffect, useCallback, useState } from "react";

interface RichMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichMarkdownEditor({
  value,
  onChange,
  placeholder = "Write your thoughts...",
}: RichMarkdownEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:text-primary/80",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText() ? editor.getHTML() : "");
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2 prose-headings:mt-3 prose-headings:mb-1.5 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-hr:my-3",
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSubmit = () => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }

    setLinkDialogOpen(false);
    setLinkUrl("");
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Insert link</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              id="link-url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLinkSubmit();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleLinkSubmit}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border border-input bg-background">
        <EditorContent editor={editor} />
        <div className="flex items-center gap-1 border-t border-border px-2 py-1.5 bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 p-0 ${editor.isActive("bold") ? "bg-secondary" : ""}`}
            title="Bold (Ctrl+B or **text**)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-7 w-7 p-0 ${editor.isActive("italic") ? "bg-secondary" : ""}`}
            title="Italic (Ctrl+I or *text*)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-7 w-7 p-0 ${editor.isActive("heading", { level: 1 }) ? "bg-secondary" : ""}`}
            title="Heading 1 (# text)"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-7 w-7 p-0 ${editor.isActive("heading", { level: 2 }) ? "bg-secondary" : ""}`}
            title="Heading 2 (## text)"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-7 w-7 p-0 ${editor.isActive("heading", { level: 3 }) ? "bg-secondary" : ""}`}
            title="Heading 3 (### text)"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-7 w-7 p-0 ${editor.isActive("bulletList") ? "bg-secondary" : ""}`}
            title="Bullet List (- text)"
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-7 w-7 p-0 ${editor.isActive("orderedList") ? "bg-secondary" : ""}`}
            title="Numbered List (1. text)"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={`h-7 w-7 p-0 ${editor.isActive("link") ? "bg-secondary" : ""}`}
            title="Link ([text](url))"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: Use markdown shortcuts like **bold**, *italic*, # headings, - lists
      </p>
    </div>
  );
}
