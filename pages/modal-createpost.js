import { useState, useEffect } from "react";
import NextImage from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function CreatePostModal({ isOpen, onClose, communityId }) {
  const { data: session } = useSession();
  const userData = session?.user;
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [perturbationLevel, setPerturbationLevel] = useState("LOW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);

  useEffect(() => {
    if (cooldownEndTime) {
      const interval = setInterval(() => {
        const timeLeft = cooldownEndTime - Date.now();
        if (timeLeft <= 0) {
          setCooldownEndTime(null);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownEndTime]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new window.Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          // Add watermark using the user's username
          const watermarkText = userData?.username || "username";
          const fontSize = 28;
          ctx.font = `${fontSize}px poppins`;
          ctx.textBaseline = "bottom";
          ctx.fillStyle = "white";
          ctx.shadowColor = "white";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          const bottomPadding = 20;
          const leftPadding = 40;
          ctx.fillText(watermarkText, leftPadding, canvas.height - bottomPadding);
          // Convert canvas to a File
          canvas.toBlob((blob) => {
            const watermarkedFile = new File([blob], file.name, { type: file.type });
            setSelectedImage(watermarkedFile);
          }, file.type);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("fileInput").click();
  };

  const bannedWords = [
    "fuck", "fucking", "shit", "damn", "bitch", "asshole", "bastard",
    "dick", "cunt", "piss", "crap", "slut", "whore", "prick", "fag",
    "nigger", "motherfucker", "cock", "pussy", "retard", "douche",
    "bullshit", "arsehole", "wanker", "tosser", "bloody", "bugger",
    "fvck", "fck", "fcking", "mf", "dfq", "dick", "pussy", "MotherFucker",
    "putangina", "gago", "tanga", "bobo", "ulol", "lintik", "hinayupak",
    "hayop", "siraulo", "tarantado", "bwisit", "tite", "pakyu",
    "pakyew", "leche", "punyeta", "inutil", "unggoy", "peste",
    "gunggong", "salot", "walanghiya", "ampota", "syet", "gago",
    "putcha", "punyemas", "hudas", "diyablo", "g@go", "8080", "kingina", "kupal",
    "t4nga", "b0b0", "inutil", "pakyu", "shet", "t4nga", "obob", "bob0",
    "kinangina", "tangina", "hayuf", "hayf", "inamo", "namo"
  ];

  const containsProfanity = (text) => {
    const regex = new RegExp(`\\b(${bannedWords.join('|')})\\b`, "gi");
    return regex.test(text);
  };

  const sanitizeText = (text) => {
    const regex = new RegExp(`\\b(${bannedWords.join('|')})\\b`, "gi");
    return text.replace(regex, (match) => "*".repeat(match.length));
  };

  const handleDescriptionChange = (e) => {
    const inputText = e.target.value;
    if (containsProfanity(inputText)) {
      setWarning("Your text contains inappropriate language. It will be filtered.");
    } else {
      setWarning(null);
    }
    setDescription(sanitizeText(inputText));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!userData || !userData.id) {
      setError("User not logged in. Please log in.");
      setLoading(false);
      return;
    }
    if (!selectedImage) {
      setError("Please select an image first.");
      setLoading(false);
      return;
    }
    if (!category) {
      setError("Please select a category.");
      setLoading(false);
      return;
    }

    try {
      // Create FormData for the perturb image API (only file and perturbation level)
      const perturbFormData = new FormData();
      perturbFormData.append("file", selectedImage);
      perturbFormData.append("perturbation_level", perturbationLevel);

      // Call the perturb image API using fetch
      const perturbRes = await fetch("http://192.168.254.105:8000/api/perturbed-image", {
        method: "POST",
        body: perturbFormData,
      });
      const perturbData = await perturbRes.json();

      if (perturbRes.status !== 201 || !perturbData.image_url) {
        setError("Failed to process image.");
        setLoading(false);
        return;
      }
      
      const imageUrl = perturbData.image_url;
      
      // Prepare payload for the create post API
      const postPayload = {
        description,
        category_id: category,
        image_url: imageUrl,
      };
      if (communityId) {
        postPayload.community_id = communityId;
      }
      
      // Call the create post API using fetch
      const postRes = await fetch("/api/post/createpost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });
      
      if (postRes.status === 201) {
        router.reload();
      } else {
        setError("Failed to create post. Please try again.");
      }
    } catch (err) {
      console.error("Error during submission:", err);
      setError("Failed to process image or create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = () => {
    if (!cooldownEndTime) return null;
    const timeLeft = cooldownEndTime - Date.now();
    if (timeLeft <= 0) return null;
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[5px] shadow-lg p-5 relative modal-container"
        style={{ width: "500px", minHeight: "200px", border: "1px solid black" }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-[24px] font-semibold text-black mb-0 -mt-4">Create a Post</h2>
          <button onClick={onClose} className="focus:outline-none flex items-center mb-4">
            <NextImage src="/svg/eks.svg" alt="Close" width={15} height={15} />
          </button>
        </div>
        <hr className="border-t border-black" style={{ borderWidth: ".05px", width: "calc(100%+40px)", margin: "0 -20px" }} />
        <div className="flex items-center mt-4 mb-4">
          <NextImage src={userData?.profileImg || "/images/user.png"} alt="Profile Image" width={40} height={40} className="rounded-full" />
          <div className="ml-3">
            <p className="text-black font-semibold text-[18px]">{userData?.name || "Anonymous"}</p>
          </div>
        </div>
        <div className="mb-1">
          <textarea
            className="w-full h-[80px] px-3 text-black text-[14px] resize-none focus:outline-none placeholder-gray-500"
            placeholder="What will you post?"
            style={{ backgroundColor: "transparent", border: "none" }}
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        {warning && <p className="text-red-500 font-regular text-center mt-2 mb-2">{warning}</p>}
        <div className="mb-4">
          <p className="text-black font-semibold mb-2">Select Perturbation Level:</p>
          <div className="flex space-x-4">
            <label className="text-black">
              <input
                type="radio"
                name="perturbation"
                value="LOW"
                checked={perturbationLevel === "LOW"}
                onChange={(e) => setPerturbationLevel(e.target.value)}
              />
              LOW
            </label>
            <label className="text-black">
              <input
                type="radio"
                name="perturbation"
                value="MEDIUM"
                checked={perturbationLevel === "MEDIUM"}
                onChange={(e) => setPerturbationLevel(e.target.value)}
              />
              MEDIUM
            </label>
            <label className="text-black">
              <input
                type="radio"
                name="perturbation"
                value="HIGH"
                checked={perturbationLevel === "HIGH"}
                onChange={(e) => setPerturbationLevel(e.target.value)}
              />
              HIGH
            </label>
          </div>
        </div>
        <div className="relative mb-4">
          <select
            className="w-full h-[40px] px-3 rounded-[4px] bg-[#F4F3F3] text-black appearance-none"
            style={{ border: "1px solid #E0E0E0" }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select the house style category</option>
            <option value="Modern">Modern</option>
            <option value="Contemporary">Contemporary</option>
            <option value="Victorian">Victorian</option>
            <option value="Traditional">Traditional</option>
            <option value="Bungalow">Bungalow</option>
          </select>
          <NextImage src="/svg/drop.svg" alt="Dropdown Icon" width={12} height={12} className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none" />
        </div>
        <div
          className="w-full h-[150px] bg-gray-800 flex flex-col items-center justify-center rounded cursor-pointer overflow-hidden"
          onClick={triggerFileInput}
          style={{ position: "relative" }}
        >
          <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {selectedImage ? (
            <NextImage
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          ) : (
            <>
              <NextImage src="/svg/addimagewhite.svg" alt="Upload Icon" width={20} height={20} />
              <span className="text-gray-300 mt-2">Add Image</span>
            </>
          )}
        </div>
        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        {cooldownEndTime && <p className="text-yellow-500 text-center mt-2">You can post again in {formatTimeLeft()}.</p>}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[5px]">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-white text-[18px] font-semibold">Processing...</span>
            </div>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="w-full h-[40px] bg-blue-500 text-white font-semibold rounded mt-4"
          disabled={loading || !!cooldownEndTime}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </motion.div>
    </div>
  );
}
