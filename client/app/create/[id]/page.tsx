"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Hash, Settings, FileEdit, Upload, Save } from "lucide-react";
import {
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useGetAssignmentsQuery,
} from "../../features/api/assignmentApi";
import toast from "react-hot-toast";

export default function AssignmentForm() {
  const router = useRouter();
  const { id } = useParams();
  const { data: assignments } = useGetAssignmentsQuery();

  const [title, setTitle] = useState("");
  const [minWords, setMinWords] = useState(500);
  const [mode, setMode] = useState<"strict" | "loose">("strict");
  const [description, setDescription] = useState("");

  const [createAssignment, { isLoading: isCreating }] =
    useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] =
    useUpdateAssignmentMutation();

  const current = id
    ? assignments?.find((a: any) => a._id === id)
    : null;

  // pre-fill form if editing
  useEffect(() => {
    if (current) {
      setTitle(current.title || "");
      setMinWords(current.minWords || 500);
      setMode(current.mode || "strict");
      setDescription(current.description || "");
    }
  }, [current]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (id) {
        // Update
        await updateAssignment({
          id: id as string,
          data: { title, minWords, mode, description },
        }).unwrap();
        toast.success("Assignment updated!");
      } else {
        // Create
        const created = await createAssignment({
          title,
          minWords,
          mode,
          description,
        }).unwrap();
        toast.success("Assignment created!");
        router.push(`/upload/${created._id}`);
        return;
      }
      router.push("/");
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          {id ? "Edit Assignment" : "Create Assignment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileEdit className="w-4 h-4" />
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Write an essay on mental health, 500 words"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
              focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Min Words */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Hash className="w-4 h-4" />
              Minimum words
            </label>
            <input
              type="number"
              value={minWords}
              onChange={(e) => setMinWords(Number(e.target.value))}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Settings className="w-4 h-4" />
              Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
              focus:ring-blue-500 focus:border-transparent outline-none transition bg-white cursor-pointer"
            >
              <option value="strict">Strict</option>
              <option value="loose">Loose</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details about the assignment..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
              focus:ring-blue-500 focus:border-transparent outline-none transition resize-y min-h-32"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 
            text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition 
            duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {id ? (
              <>
                <Save className="w-5 h-5" />
                {isUpdating ? "Updating..." : "Save Changes"}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                {isCreating ? "Creating..." : "Create & Upload PDFs"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
