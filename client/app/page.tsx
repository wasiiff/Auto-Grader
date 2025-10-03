"use client";

import Link from "next/link";
import {
  Loader2,
  FileText,
  PlusCircle,
  Upload,
  BarChart3,
  Trash2,
  Pencil,
  Calendar,
  Settings,
  AlertCircle,
} from "lucide-react";
import {
  useGetAssignmentsQuery,
  useDeleteAssignmentMutation,
} from "./features/api/assignmentApi";
import { useState } from "react";

export default function Home() {
  const { data: assignments, isLoading, refetch } = useGetAssignmentsQuery();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    setLoadingId(id);
    try {
      await deleteAssignment(id).unwrap();
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                AI Assignment Checker
              </h1>
              <p className="text-gray-600 mt-1">
                Create an assignment, upload student PDFs, and let AI evaluate
                them.
              </p>
            </div>
          </div>

          {/* Create Button */}
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-5 h-5" />
            Create New Assignment
          </Link>
        </div>

        {/* Assignments Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <span className="text-gray-600 text-lg font-medium">
              Loading assignments...
            </span>
          </div>
        ) : !assignments || assignments.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-16 text-center shadow-md">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Assignments Yet
              </h3>
              <p className="text-gray-600">
                Get started by creating your first assignment above.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <FileText className="w-4 h-4" />
                        Title
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <Settings className="w-4 h-4" />
                        Mode
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <Calendar className="w-4 h-4" />
                        Created
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((a: any) => (
                    <tr
                      key={a._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {a.title}
                        </div>
                        {a.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {a.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                            a.mode === "strict"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {a.mode === "strict" ? "Strict" : "Loose"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(a.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href={`/upload/${a._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow transition-all duration-150"
                            title="Upload Submissions"
                          >
                            <Upload className="w-4 h-4" />
                            <span className="hidden lg:inline">Upload</span>
                          </Link>
                          <Link
                            href={`/upload/${a._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow transition-all duration-150"
                            title="View Results"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden lg:inline">Results</span>
                          </Link>
                          <Link
                            href={`/create/${a._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow transition-all duration-150"
                            title="Edit Assignment"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="hidden lg:inline">Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(a._id)}
                            disabled={loadingId === a._id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Assignment"
                          >
                            {loadingId === a._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {assignments.map((a: any) => (
                <div
                  key={a._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {a.title}
                    </h3>
                    {a.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {a.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          a.mode === "strict"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {a.mode === "strict" ? "Strict" : "Loose"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/upload/${a._id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Link>
                    <Link
                      href={`/upload/${a._id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Results
                    </Link>
                    <Link
                      href={`/create/${a._id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(a._id)}
                      disabled={loadingId === a._id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md disabled:opacity-50"
                    >
                      {loadingId === a._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
