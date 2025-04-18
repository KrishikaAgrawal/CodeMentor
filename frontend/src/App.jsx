import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import axios from "axios";
import jsPDF from "jspdf"; // ✅ Import jsPDF

function App() {
  const [code, setCode] = useState(`def sum():\n  return a + b\n`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    prism.highlightAll();
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  async function reviewCode() {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/ai/get-review/",
        { code }
      );
      setReview(response.data);
    } catch (error) {
      console.error("Error fetching review:", error);
      setReview("❌ Error while fetching review.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);
    }
  }

  // ✅ Download as .md
  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ✅ Download as .pdf
  function downloadPDF(content) {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 10);
    doc.save("review.pdf");
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-black dark:bg-gray-950 dark:text-white p-6 gap-6 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="w-full flex flex-col sm:flex-row justify-between items-center py-5 text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 shadow-xl rounded-xl tracking-wide px-6">
        <h1 className="text-center sm:text-left">AI Code Reviewer 🤖</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-4 sm:mt-0 text-sm bg-black/30 dark:bg-white/20 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-black/40 dark:hover:bg-white/30 transition"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
        {/* Left Column - Editor */}
        <div className="w-full lg:w-1/2 bg-white text-gray-800 dark:bg-gray-900 dark:text-white p-6 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700 overflow-auto custom-scroll">
          <label className="block mb-3">
            <input
              type="file"
              accept=".js,.py,.css,.cpp,.cs,.ts,.html,.json,.java"
              onChange={handleFileUpload}
              className="block w-full text-sm text-black dark:text-gray-300 bg-white dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </label>

          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-white text-sm">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) =>
                prism.highlight(code, prism.languages.javascript, "javascript")
              }
              padding={12}
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 14,
              }}
            />
          </div>

          <button
            onClick={reviewCode}
            className="w-full mt-4 py-3 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 rounded-lg shadow-lg transition transform hover:scale-105"
          >
            {loading ? "Analyzing..." : "Review Code 🤖"}
          </button>
        </div>

        {/* Right Column - Review Output */}
        <div className="w-full lg:w-1/2 bg-white text-gray-800 dark:bg-gray-900 dark:text-white p-6 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700 overflow-auto custom-scroll text-sm">
          <h2 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
            Review Result 📝
          </h2>
          <Markdown
            rehypePlugins={[rehypeHighlight]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-pink-400 font-semibold underline"
                />
              ),
            }}
            className={`prose ${
              darkMode ? "prose-invert" : "prose-gray"
            } max-w-none`}
          >
            {review}
          </Markdown>

          {/* ✅ Download Buttons */}
          {review && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => downloadFile("review.md", review)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
              >
                📥 Download (.md)
              </button>
              <button
                onClick={() => downloadPDF(review)}
                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-500 transition"
              >
                📄 Download (.pdf)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
