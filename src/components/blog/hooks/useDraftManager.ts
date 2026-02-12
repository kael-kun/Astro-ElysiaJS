export const useDraftManager = () => {
  const saveDraft = (data: any) => {
    localStorage.setItem("blog-draft", JSON.stringify(data));
    console.log("Draft saved!");
  };

  const loadDraft = () => {
    const draft = localStorage.getItem("blog-draft");
    return draft ? JSON.parse(draft) : null;
  };

  return { saveDraft, loadDraft };
};