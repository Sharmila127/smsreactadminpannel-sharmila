import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FONTS } from "../../constants/uiConstants";
import Client from "../../api";
import { toast } from "react-toastify";
// ✅ import your api call

const PasswordSettings = () => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ states for form values
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ optional: loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    // ✅ basic validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    try {
      setLoading(true);
      // ✅ call your API
      const payload = {
        oldPassword,
        newPassword,
        confirmPassword,
      };
      const response = await new Client().admin.auth.postreset(payload);
      console.log("Reset Response:", response);
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error( "Old password is incorrect or something went wrong.");
      setError("Old password is incorrect or something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 pb-52">
      <div className="grid grid-cols-2 gap-4">
        {/* Old Password */}
        <div>
          <label
            style={{ ...FONTS.paragraph }}
            className="block mb-2 text-sm font-medium !text-gray-900 dark:text-white"
          >
            Old Password
          </label>
          <div className="relative">
            <input
              id="old-password"
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-3xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-3/4 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter your old password"
            />
            <button
              type="button"
              onClick={() => setShowOld((prev) => !prev)}
              className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
            >
              {showOld ? (
                <Eye className="w-5 h-5 text-gray-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            style={{ ...FONTS.paragraph }}
            className="block mb-2 text-sm font-medium !text-gray-900 dark:text-white"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-3xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-3/4 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
            >
              {showNew ? (
                <Eye className="w-5 h-5 text-gray-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="mt-8">
        <label
          style={{ ...FONTS.paragraph }}
          className="block mb-2 text-sm font-medium !text-gray-900 dark:text-white"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-3xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-3/4 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter your confirm password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
          >
            {showConfirm ? (
              <Eye className="w-5 h-5 text-gray-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}

      {/* Buttons */}
      <div className="mt-10 flex">
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="rounded-3xl p-3 text-[12px] !text-white disabled:opacity-50"
          style={{ backgroundColor: "#9b111e", ...FONTS.subParagraph }}
        >
          {loading ? "Saving..." : "Confirm Password"}
        </button>
        {/* <a
          href="#"
          style={{ ...FONTS.paragraph }}
          className="text-red-700 ml-auto"
        >
          Forgot Password ?
        </a> */}
      </div>
    </div>
  );
};

export default PasswordSettings;
