"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Upload,
  Download,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUploadAssignmentMutation } from "../../features/api/assignmentApi";

export default function UploadPage() {
  const { id } = useParams<{ id: string }>();
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<any>(null);

  const [uploadAssignment, { isLoading }] = useUploadAssignmentMutation();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!files || !id) return toast.error("Please select files");

    try {
      const res = await uploadAssignment({ id, files }).unwrap();
      setResults(res);
      toast.success("Files processed! Download CSV now.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Upload failed");
    }
  }

  function downloadCsv() {
    if (!id) return;
    const url = `${
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
    }/assignments/${id}/download`;
    window.open(url, "_blank");
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Upload className="w-8 h-8 text-blue-600" />
          Upload PDFs for Assignment
        </h2>

        {/* Form */}
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileText className="w-4 h-4" />
              Select PDF Files
            </label>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 
                  file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 
                  file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Selected Files Count */}
            {files && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-medium">
                  {files.length} file(s) selected
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 
                disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold 
                rounded-lg shadow-md hover:shadow-lg transition duration-200 transform 
                hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Evaluate
                </>
              )}
            </button>

            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 
                text-white font-semibold rounded-lg shadow-md hover:shadow-lg 
                transition duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Download Marks CSV
            </button>
          </div>
        </form>

        {/* Results Section */}
        {/* Results Section */}
        {results && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Results
            </h3>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Score
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {results.processed?.map((r: any, idx: number) => {
                    // Remove extension first
                    const baseName = r.originalName.replace(/\.[^/.]+$/, "");
                    const parts = baseName.split("_");

                    let rollNo = "";
                    let studentName = "";

                    if (parts.length === 2) {
                      // Check if first part is numeric => roll no first
                      if (/^\d+$/.test(parts[0])) {
                        rollNo = parts[0];
                        studentName = parts[1];
                      } else if (/^\d+$/.test(parts[1])) {
                        // roll no second
                        rollNo = parts[1];
                        studentName = parts[0];
                      } else {
                        // fallback if neither part is numeric
                        studentName = parts[0];
                        rollNo = parts[1];
                      }
                    } else {
                      // fallback if format not followed
                      studentName = baseName;
                    }

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-800">
                          {rollNo}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 capitalize">
                          {studentName}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 font-semibold">
                          {r.score !== undefined ? (
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-bold ${
                                r.score >= 50
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {r.score}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Processing Notice */}
        {isLoading && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <h4 className="font-semibold text-blue-900">
                  Processing your submissions...
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  This may take a few moments. Please don’t close this page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
