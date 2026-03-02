import { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { ModalHeader } from "../../ui/ModalHeader";
import { ModalBody } from "../../ui/ModalBody";
import { ModalFooter } from "../../ui/ModalFooter";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { useApiKeys, type ApiKeyWithFullKey } from "../hooks/useApiKeys";
import { useToastContext } from "src/providers/ToastProvider";

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function ApiIntegrationModal({ isOpen, onClose, projectId, projectName }: ApiIntegrationModalProps) {
  const { apiKeys, fetchApiKeys, createApiKey, deleteApiKey } = useApiKeys();
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKeyWithFullKey | null>(null);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);

  // get domain from url
  const domain = window.location.origin;

  const { error: showError, success: showSuccess } = useToastContext();

  useEffect(() => {
    if (isOpen && projectId) {
      fetchApiKeys(projectId);
    }
  }, [isOpen, projectId, fetchApiKeys]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const result = await createApiKey(projectId, newKeyName.trim());
      setNewlyCreatedKey(result);
      setNewKeyName("");
      showSuccess("API key created successfully!");
    } catch (err) {
      showError("Failed to create API key. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    setDeleteConfirmKey(keyId);
  };

  const confirmDeleteKey = async () => {
    if (!deleteConfirmKey) return;

    try {
      await deleteApiKey(deleteConfirmKey);
      showSuccess("API key deleted successfully.");
    } catch (err) {
      showError("Failed to delete API key. Please try again.");
    } finally {
      setDeleteConfirmKey(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader title={`API Integration - ${projectName}`} />

      <ModalBody>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate API Key</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a new API key to access your blog data programmatically. The key will be shown only once.
            </p>

            {newlyCreatedKey ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">API Key Created Successfully!</span>
                  <Button variant="ghost" size="sm" onClick={() => setNewlyCreatedKey(null)}>
                    Create Another
                  </Button>
                </div>
                <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm break-all">
                  {newlyCreatedKey.fullKey}
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="keyName"
                  placeholder="e.g., Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                />
                <Button variant="primary" onClick={handleCreateKey} disabled={!newKeyName.trim() || isCreating}>
                  {isCreating ? "Creating..." : "Generate"}
                </Button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your API Keys</h3>
            {apiKeys.length === 0 ? (
              <p className="text-sm text-gray-500">No API keys yet. Generate one above to get started.</p>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{key.name}</div>
                      <div className="text-sm text-gray-500 font-mono">{key.key_prefix}...</div>
                      <div className="text-xs text-gray-400">
                        Created: {formatDate(key.createdAt)}
                        {key.last_used_at && ` • Last used: ${formatDate(key.last_used_at)}`}
                      </div>
                    </div>
                    {deleteConfirmKey === key.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={confirmDeleteKey}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirm
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmKey(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API Documentation</h3>
            <p className="text-sm text-gray-500 mb-4">Use your API key to fetch blog data from your application.</p>

            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase">Base URL</span>
              </div>
              <code className="text-green-400 text-sm font-mono block mb-4">`{domain}/api/public`</code>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase">List Blogs</span>
              </div>
              <pre className="text-gray-300 text-sm font-mono mb-4">{`curl -X GET \\
  ${domain}/api/public/${projectId}/blogs \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxxxxxxxxxxxx"`}</pre>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase">Get Blog Details</span>
              </div>
              <pre className="text-gray-300 text-sm font-mono">{`curl -X GET \\
  ${domain}/api/public/${projectId}/blogs/{blog_id} \\
  -H "X-API-Key: pk_live_xxxxxxxxxxxxxxxxxxxxxx"`}</pre>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase">Query Parameters (List)</span>
              </div>
              <pre className="text-gray-300 text-sm font-mono">{`?page=1&limit=10`}</pre>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-1">Rate Limits</h4>
              <p className="text-sm text-blue-700">
                API requests are limited to <strong>100 requests per minute</strong> per API key.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
