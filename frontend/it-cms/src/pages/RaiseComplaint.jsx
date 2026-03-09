import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const RaiseComplaint = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/complaints/types")
      .then((res) => {
        const data = res.data;
        setCategoryMap(data);
        setCategories(Object.keys(data));
      })
      .catch((err) => {
        console.error("Error fetching complaint types:", err);
      });
  }, []);

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);
    setSubcategories(categoryMap[selected] || []);
    setSelectedSubcategory("");
  };

  const handleClosePopup = () => {
    setIsSubmitted(false);
    setGeneratedId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedSubcategory ) {
      setStatusMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/complaints/submit",
        {
          name: user.name,
          email: user.email,
          
          employeeId: user.employeeId,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          description,
        },
        { withCredentials: true }
      );

      if (response.data.message === "Complaint submitted successfully.") {
        setGeneratedId(response.data.complaintId); // Adjust key to match backend
        setIsSubmitted(true);
        setSelectedCategory("");
        setSelectedSubcategory("");
        setDescription("");
      } else {
        setStatusMessage("Error submitting complaint.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatusMessage("Server error. Try again later.");
    }
  };

  if (!user) return <div className="text-center p-6">Loading user info...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {isSubmitted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#D2FBA4] p-6 rounded-xl w-[420px] shadow-xl animate-fadeIn text-center">
            <h2 className="text-2xl font-bold text-[#1D741B] mb-2">Complaint Submitted!</h2>
            <p className="text-[#3FAE30] mb-2">Your complaint has been successfully submitted.</p>
            {generatedId && (
              <p className="text-[#3FAE30] font-semibold mb-4">Complaint ID: {generatedId}</p>
            )}
            <button
              onClick={handleClosePopup}
              className="w-full text-sm text-[#9a9a9a] underline hover:text-[#5f5f5f]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Raise a Complaint</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ReadOnlyField label="Employee ID" value={user.employeeId} />
          <ReadOnlyField label="Name" value={user.name} />
          <ReadOnlyField label="Department" value={user.department?.name || "Not assigned"} />
          <ReadOnlyField label="Email" value={user.email} />

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              rows="4"
              
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          >
            Submit Complaint
          </button>

          {statusMessage && (
            <div className="mt-4 text-center text-sm text-red-600">{statusMessage}</div>
          )}
        </form>
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      disabled
      className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
    />
  </div>
);

export default RaiseComplaint;
