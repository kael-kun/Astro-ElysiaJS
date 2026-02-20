import MDEditor from "@uiw/react-md-editor";

interface BlogEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  height?: string;
}

export function BlogEditor({ content, onContentChange, height = "900px" }: BlogEditorProps) {
  return (
    <div style={{ height }}>
      <MDEditor
        value={content}
        onChange={(value) => onContentChange(value || "")}
        height={height}
        preview="live"
      />
    </div>
  );
}