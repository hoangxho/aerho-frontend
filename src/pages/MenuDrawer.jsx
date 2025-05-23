import React from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, CreditCardIcon, UsersIcon, DocumentDuplicateIcon, Squares2X2Icon, QuestionMarkCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";

export default function MenuDrawer({
  isMenuOpen,
  setIsMenuOpen,
  menuPage,
  setMenuPage,
  accountInfo,
  showChangeEmail,
  setShowChangeEmail,
  showChangePassword,
  setShowChangePassword,
  newEmail,
  setNewEmail,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  toggleTheme,
  theme,
  navigate, // <-- Make sure to pass this from parent!
  referrals = [],
  teamMembers = [],
  onAddTeamMember = () => {}
}) {
  const totalReferrals = referrals.length;
  const signedUpCount = referrals.filter(r => r.status === "Signed Up").length;

  // State for referral batches and progress
  const [freeMonthsEarned, setFreeMonthsEarned] = React.useState(0);
  const [referralsThisPeriod, setReferralsThisPeriod] = React.useState(0);
  const [showReward, setShowReward] = React.useState(false);

  // Track previous signedUpCount to detect increments
  const prevSignedUpCount = React.useRef(signedUpCount);

  // Effect: update progress bar and batches as new referrals come in
  React.useEffect(() => {
    // Calculate how many new "signed up" referrals have occurred since last check
    const diff = signedUpCount - prevSignedUpCount.current;
    // If the signedUpCount decreased (shouldn't happen, but reset progress)
    if (signedUpCount < prevSignedUpCount.current) {
      setReferralsThisPeriod(signedUpCount % 3);
      setFreeMonthsEarned(Math.floor(signedUpCount / 3));
      setShowReward(false);
      prevSignedUpCount.current = signedUpCount;
      return;
    }
    // Add new signups to current period
    setReferralsThisPeriod((period) => {
      let newPeriod = period + diff;
      // If the new period reaches or exceeds 3, handle batch completion(s)
      let batchCount = 0;
      while (newPeriod >= 3) {
        batchCount += 1;
        newPeriod -= 3;
      }
      if (batchCount > 0) {
        // Show reward, then after a delay, increment free months and reset period
        setShowReward(true);
        setTimeout(() => {
          setFreeMonthsEarned((fm) => fm + batchCount);
          setShowReward(false);
          setReferralsThisPeriod(newPeriod);
        }, 1500); // 1.5s for reward message
        // Do not update referralsThisPeriod immediately, will be reset after reward
        prevSignedUpCount.current = signedUpCount;
        return 3; // Hold at 3 to show reward animation
      }
      prevSignedUpCount.current = signedUpCount;
      return newPeriod;
    });
    // eslint-disable-next-line
  }, [signedUpCount]);

  // On mount or when referrals change, initialize state
  React.useEffect(() => {
    setFreeMonthsEarned(Math.floor(signedUpCount / 3));
    setReferralsThisPeriod(signedUpCount % 3);
    prevSignedUpCount.current = signedUpCount;
    setShowReward(false);
    // eslint-disable-next-line
  }, [isMenuOpen]);

  const neededForFreeMonth = 3 - referralsThisPeriod;

  // If you want to use useNavigate here, you can remove navigate from props and use:
  // const navigate = useNavigate();

  // Reset menuPage to "main" every time the menu CLOSES
  React.useEffect(() => {
    if (!isMenuOpen) {
      setMenuPage("main");
    }
    // Only run when isMenuOpen changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  return (
    <div
      tabIndex={-1}
      onKeyDown={(e) => e.stopPropagation()}
      className={`fixed top-16 bottom-10 right-10 w-80 bg-white dark:bg-[#253447] shadow-lg z-50 rounded-3xl p-6 transform transition-all duration-500 ease-in-out overflow-y-auto focus:outline-none ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div
        className="relative w-full h-full overflow-hidden focus:outline-none"
        tabIndex={-1}
        style={{ outline: "none" }}
      >
        {/* Main Menu */}
        <div
          className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${menuPage === "main" ? "translate-x-0" : "-translate-x-full"}`}
          tabIndex={menuPage === "main" ? 0 : -1}
          aria-hidden={menuPage !== "main"}
        >
          <div className="p-6 space-y-6 text-gray-800 dark:text-white w-full">
            {/* Menu Items */}
            <div className="flex items-center transform transition-transform duration-200 hover:scale-105 hover:font-semibold cursor-pointer" onClick={() => setMenuPage("account")}>
              <UserIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-semibold tracking-wide">Account</span>
            </div>
            <div className="flex items-center transform transition-transform duration-200 hover:scale-105 hover:font-semibold cursor-pointer" onClick={() => setMenuPage("subscription")}>
              <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-semibold tracking-wide">Subscription</span>
            </div>
            <div className="flex items-center transform transition-transform duration-200 hover:scale-105 hover:font-semibold cursor-pointer" onClick={() => setMenuPage("referrals")}>
              <Squares2X2Icon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-semibold tracking-wide">Referrals</span>
            </div>
            {/* Templates menu item inserted between Referrals and Team Members */}
            <div className="flex items-center transform transition-transform duration-200 hover:scale-105 hover:font-semibold cursor-pointer" onClick={() => setMenuPage("templates")}>
              <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-semibold tracking-wide">Templates</span>
            </div>
            <div className="flex items-center transform transition-transform duration-200 hover:scale-105 hover:font-semibold cursor-pointer" onClick={() => setMenuPage("team")}>
              <UsersIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-semibold tracking-wide">Team Members</span>
            </div>
            <div className="flex items-center transform transition-transform duration-200 hover:scale-105 hover:font-semibold cursor-pointer" onClick={() => setMenuPage("support")}>
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-semibold tracking-wide">Support</span>
            </div>
            <div className="flex items-center transform transition-transform duration-200 hover:scale-105 hover:font-semibold cursor-pointer" onClick={() => setMenuPage("settings")}>
              <Cog6ToothIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-semibold tracking-wide">Settings</span>
            </div>
          </div>
        </div>
        {/* Account Page */}
        <div
          className={`absolute top-0 left-full w-full transition-transform duration-500 ease-in-out ${menuPage === "account" ? "-translate-x-full opacity-100 pointer-events-auto" : "translate-x-0 opacity-0 pointer-events-none"}`}
          tabIndex={menuPage === "account" ? 0 : -1}
          aria-hidden={menuPage !== "account"}
        >
          <div className="p-6 space-y-6 text-gray-800 dark:text-white w-full">
            <div
              onClick={() => {
                setMenuPage("main");
                setShowChangeEmail(false);
                setShowChangePassword(false);
                setNewEmail("");
                setCurrentPassword("");
                setNewPassword("");
              }}
              className="text-blue-500 cursor-pointer font-semibold transform transition-transform duration-200 hover:scale-105"
            >
              ← Back
            </div>
            <div className="space-y-6 text-sm text-gray-800 dark:text-white">
              {/* Name */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Name:</span>
                </div>
                <div className="mt-1">{accountInfo.name}</div>
              </div>
              {/* Email */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Email:</span>
                  <button onClick={() => setShowChangeEmail(!showChangeEmail)} className="text-blue-600 hover:underline text-xs">Change</button>
                </div>
                <div className="mt-1">{accountInfo.email}</div>
              </div>
              {showChangeEmail && (
                <div className="space-y-2 mt-2">
                  <input
                    type="email"
                    placeholder="New Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md text-sm"
                  />
                  <button
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    onClick={async () => {
                      const user = auth.currentUser;
                      const credential = EmailAuthProvider.credential(user.email, currentPassword);
                      try {
                        await reauthenticateWithCredential(user, credential);
                        await sendEmailVerification(user, {
                          url: "https://aerho.io/__/auth/action"
                        });
                        alert("Verification email sent. Please check your inbox and verify the new email before proceeding.");
                      } catch (error) {
                        console.error("Email update error:", error);
                        alert("Failed to send verification email. " + error.message);
                      }
                    }}
                  >
                    Update Email
                  </button>
                </div>
              )}
              {/* Password */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Password:</span>
                  <button onClick={() => setShowChangePassword(!showChangePassword)} className="text-blue-600 hover:underline text-xs">Change</button>
                </div>
                <div className="mt-1">••••••••</div>
              </div>
              {showChangePassword && (
                <div className="space-y-2 mt-2">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md text-sm"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md text-sm"
                  />
                  <button
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    onClick={async () => {
                      const user = auth.currentUser;
                      const credential = EmailAuthProvider.credential(user.email, currentPassword);
                      try {
                        await reauthenticateWithCredential(user, credential);
                        await user.reload(); // Refresh user data
                        if (!user.emailVerified) {
                          await sendEmailVerification(user);
                          alert("Please verify your email before changing your password. A verification email has been sent.");
                          return;
                        }
                        await updatePassword(user, newPassword);
                        alert("Password updated successfully!");
                        setShowChangePassword(false);
                      } catch (error) {
                        console.error("Password update error:", error);
                        alert("Failed to update password. " + error.message);
                      }
                    }}
                  >
                    Update Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Subscription Page */}
        <div
          className={`absolute top-0 left-full w-full transition-transform duration-500 ease-in-out ${menuPage === "subscription" ? "-translate-x-full opacity-100 pointer-events-auto" : "translate-x-0 opacity-0 pointer-events-none"}`}
          tabIndex={menuPage === "subscription" ? 0 : -1}
          aria-hidden={menuPage !== "subscription"}
        >
          <div className="p-6 space-y-6 text-gray-800 dark:text-white w-full">
            <div
              onClick={() => setMenuPage("main")}
              className="text-blue-500 cursor-pointer font-semibold transform transition-transform duration-200 hover:scale-105"
            >
              ← Back
            </div>
            <div>
              <div className="mb-4 text-lg font-semibold">Aerho Provider Subscription</div>
              <div className="mb-2 text-base">
                <span className="font-medium">Subscribe for $149.99/month</span>
              </div>
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out w-full"
                onClick={async () => {
                  try {
                    const response = await fetch("http://localhost:4242/create-checkout-session", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({}) // Ensure body is not empty
                    });

                    const data = await response.json();
                    if (data.url) {
                      window.location = data.url;
                    } else {
                      console.error("Stripe response error:", data);
                      alert("Failed to create checkout session.");
                    }
                  } catch (error) {
                    console.error("Fetch error:", error);
                    alert("Error connecting to payment server.");
                  }
                }}
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
        {/* Team Members Page */}
        <div
          className={`absolute top-0 left-full w-full transition-transform duration-500 ease-in-out ${menuPage === "team" ? "-translate-x-full opacity-100 pointer-events-auto" : "translate-x-0 opacity-0 pointer-events-none"}`}
          tabIndex={menuPage === "team" ? 0 : -1}
          aria-hidden={menuPage !== "team"}
        >
          <TeamMembersSection
            setMenuPage={setMenuPage}
            teamMembers={teamMembers}
            onAddTeamMember={onAddTeamMember}
          />
        </div>
        {/* Referrals Page */}
        <ReferralsSection
          menuPage={menuPage}
          setMenuPage={setMenuPage}
          referralsThisPeriod={referralsThisPeriod}
          freeMonthsEarned={freeMonthsEarned}
          showReward={showReward}
          neededForFreeMonth={neededForFreeMonth}
          totalReferrals={totalReferrals}
          referrals={referrals}
          tabIndex={menuPage === "referrals" ? 0 : -1}
          aria-hidden={menuPage !== "referrals"}
        />
        {/* Support Page */}
        <div
          className={`absolute top-0 left-full w-full transition-transform duration-500 ease-in-out ${menuPage === "support" ? "-translate-x-full opacity-100 pointer-events-auto" : "translate-x-0 opacity-0 pointer-events-none"}`}
          tabIndex={menuPage === "support" ? 0 : -1}
          aria-hidden={menuPage !== "support"}
        >
          <div className="p-6 space-y-6 text-gray-800 dark:text-white w-full">
            <div
              onClick={() => setMenuPage("main")}
              className="text-blue-500 cursor-pointer font-semibold transform transition-transform duration-200 hover:scale-105"
            >
              ← Back
            </div>
            <div className="space-y-4 text-sm dark:text-gray-300">
              <div className="text-lg font-semibold text-white dark:text-white">Support</div>
              <p>If you're experiencing issues or need help with Aerho, please reach out to us using one of the options below:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  Email us at{" "}
                  <a href="mailto:support@aerho.io" className="text-blue-400 hover:underline">
                    support@aerho.io
                  </a>
                </li>
                <li>Chat with us live in the bottom-right corner</li>
                <li>
                  Visit our{" "}
                  <a
                    href="https://aerho.io/help"
                    className="text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Help Center
                  </a>{" "}
                  for FAQs
                </li>
              </ul>
              <div className="mt-4">
                <button
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow"
                  onClick={() => window.open("mailto:support@aerho.io", "_blank")}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Templates Page */}
        <TemplateUploadSection
          menuPage={menuPage}
          setMenuPage={setMenuPage}
          tabIndex={menuPage === "templates" ? 0 : -1}
          aria-hidden={menuPage !== "templates"}
        />
        {/* Settings Page */}
        <div
          className={`absolute top-0 left-full w-full transition-transform duration-500 ease-in-out ${menuPage === "settings" ? "-translate-x-full opacity-100 pointer-events-auto" : "translate-x-0 opacity-0 pointer-events-none"}`}
          tabIndex={menuPage === "settings" ? 0 : -1}
          aria-hidden={menuPage !== "settings"}
        >
          <div className="p-6 space-y-6 text-gray-800 dark:text-white w-full">
            <div
              onClick={() => setMenuPage("main")}
              className="text-blue-500 cursor-pointer font-semibold transform transition-transform duration-200 hover:scale-105"
            >
              ← Back
            </div>
            <div>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      onChange={toggleTheme}
                      checked={theme === "dark"}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-600 rounded-full peer dark:peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Log Off button at the bottom right - only show on main menu */}
        {menuPage === "main" && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 text-sm"
            >
              Log Off
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// TeamMembersSection component
function TeamMembersSection({ setMenuPage, teamMembers = [], onAddTeamMember }) {
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("limited"); // default to Limited Access
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setError("Please enter both name and email.");
      return;
    }
    setSubmitting(true);
    try {
      await onAddTeamMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole // submit the role
      });
      setSuccess("Invitation sent!");
      setInviteName("");
      setInviteEmail("");
      setInviteRole("limited");
    } catch (err) {
      setError("Failed to invite member.");
    }
    setSubmitting(false);
  };

  // Helper to display role as string
  const displayRole = (role) => {
    if (role === "complete") return "Complete Access";
    // Show Limited Access if missing or "limited"
    return "Limited Access";
  };

  return (
    <div className="p-6 space-y-6 text-gray-800 dark:text-white w-full">
      <div
        onClick={() => setMenuPage("main")}
        className="text-blue-500 cursor-pointer font-semibold transform transition-transform duration-200 hover:scale-105"
      >
        ← Back
      </div>
      <div>
        <div className="text-lg font-semibold mb-2">Team Members</div>
        {/* Invite Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              className="appearance-none border border-gray-300 focus:border-blue-500 outline-none shadow-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md h-11 w-full text-base px-4"
              disabled={submitting}
            />
            <input
              type="email"
              placeholder="Email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="appearance-none border border-gray-300 focus:border-blue-500 outline-none shadow-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md h-11 w-full text-base px-4"
              disabled={submitting}
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="appearance-none border border-gray-300 focus:border-blue-500 outline-none shadow-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md h-11 w-full text-base px-4"
              disabled={submitting}
            >
              <option value="complete">Complete Access</option>
              <option value="limited">Limited Access</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-md mt-5 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Team Member"}
          </button>
          {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
          {success && <div className="text-green-600 text-xs mt-1">{success}</div>}
        </form>
        {/* Team Members List/Table */}
        <div>
          <div className="text-md font-semibold mb-1">Current Members</div>
          {teamMembers.length === 0 ? (
            <div className="text-gray-400 text-sm">No team members yet.</div>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left pr-4 pb-1">Name</th>
                  <th className="text-left pr-4 pb-1">Email</th>
                  <th className="text-left pr-4 pb-1">Role</th>
                  <th className="text-left pb-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, idx) => (
                  <tr key={idx}>
                    <td className="pr-4">{member.name}</td>
                    <td className="pr-4">{member.email}</td>
                    <td className="pr-4">{displayRole(member.role)}</td>
                    <td>{member.status || "Invited"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
// Referral Progress Bar component
function ReferralProgressBar({ referralsThisPeriod }) {
  // Clamp to [0,3]
  const progress = Math.min(referralsThisPeriod, 3);
  // Animate color: blue to green if complete
  // Tailwind: blue-500 = #3b82f6, green-500 = #22c55e
  // We'll animate using inline style for a smooth transition.
  const isComplete = progress >= 3;
  const barColor = isComplete
    ? "#22c55e"
    : "#3b82f6";
  // Animate color transition
  return (
    <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden mb-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${(progress / 3) * 100}%`,
          background: barColor,
          transitionProperty: "width, background-color"
        }}
      ></div>
    </div>
  );
}

// RewardUnlocked: checkmark and "Reward Unlocked!" with fade-in
function RewardUnlocked({ show }) {
  // Use a fade-in transition
  return (
    <div
      className={`flex items-center gap-2 mt-1 transition-opacity duration-700 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!show}
    >
      {/* Checkmark SVG, green for both light/dark */}
      <svg
        className="w-5 h-5 text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-semibold text-green-500">Reward Unlocked!</span>
    </div>
  );
}
// ReferralsSection component with info box show/hide
function ReferralsSection({
  menuPage,
  setMenuPage,
  referralsThisPeriod,
  freeMonthsEarned,
  showReward,
  neededForFreeMonth,
  totalReferrals,
  referrals,
  tabIndex,
  ...rest
}) {
  const [showReferralInfo, setShowReferralInfo] = React.useState(true);
  return (
    <div
      className={`absolute top-0 left-full w-full transition-transform duration-500 ease-in-out ${menuPage === "referrals" ? "-translate-x-full opacity-100 pointer-events-auto" : "translate-x-0 opacity-0 pointer-events-none"}`}
      tabIndex={typeof tabIndex === "undefined" ? (menuPage === "referrals" ? 0 : -1) : tabIndex}
      aria-hidden={menuPage !== "referrals"}
      {...rest}
    >
      <div className="p-6 space-y-6 text-gray-800 dark:text-white w-full flex flex-col h-full">
        <div
          onClick={() => setMenuPage("main")}
          className="text-blue-500 cursor-pointer font-semibold transform transition-transform duration-200 hover:scale-105"
        >
          ← Back
        </div>
        {/* Referrals Header */}
        <div className="mb-1">
          <div className="flex items-center mb-1">
            <div className="text-lg font-semibold">Refer 3 providers, get 1 month free!</div>
          </div>
          {/* Progress Bar and Reward Animation */}
          <div className="flex flex-col gap-1">
            {/* Progress Bar */}
            <ReferralProgressBar referralsThisPeriod={referralsThisPeriod} />
            {/* Free Months Earned */}
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">
              Free Months Earned: {freeMonthsEarned}
            </div>
            <div
              className="text-sm font-medium mt-1"
              style={{
                color: showReward
                  ? "rgb(34 197 94)"
                  : undefined
              }}
            >
              Referrals this period: {referralsThisPeriod} / 3 (Need {neededForFreeMonth} more)
            </div>
            {/* Reward Animation */}
            <RewardUnlocked show={showReward} />
          </div>
        </div>
        {/* Referral Link */}
        <div className="mb-2">
          <div className="text-md font-semibold mb-1">Your Referral Link</div>
          <div className="flex items-center space-x-2">
            <input
              readOnly
              value="https://aerho.io/ref/abc123"
              className="flex-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-100"
              style={{ minWidth: '0' }}
            />
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-700"
              onClick={() => {
                navigator.clipboard.writeText("https://aerho.io/ref/abc123");
              }}
            >
              Copy
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="flex space-x-6 mb-2">
          <div>
            <div className="text-sm text-gray-400">Total Referrals</div>
            <div className="text-lg font-bold">{totalReferrals}</div>
          </div>
        </div>
        {/* Referral Table + Info Box/Learn More in a flex-col so info box/button always at bottom */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="mb-2 relative flex-1 min-h-0">
            <div className="text-sm font-semibold mb-1">Referral Status</div>
            <div className="max-h-40 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pr-4 pb-1">Provider</th>
                    <th className="text-left pr-4 pb-1">Status</th>
                    <th className="text-left pb-1">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.length === 0 ? (
                    <tr>
                      <td className="pr-4 text-gray-400" colSpan={3}>No referrals yet</td>
                    </tr>
                  ) : (
                    referrals.map((referral, index) => (
                      <tr key={index}>
                        <td className="pr-4">{referral.name}</td>
                        <td className="pr-4">{referral.status}</td>
                        <td>{referral.status === "Signed Up" ? "✓" : "–"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* How Referrals Work Info Box or Learn More, always at bottom */}
          <div className="mt-3">
            {showReferralInfo && (
              <div className="text-xs bg-blue-100 dark:bg-blue-900 rounded-lg p-2 relative">
                <button
                  className="absolute top-1 right-2 text-blue-700 dark:text-blue-300 text-base font-bold px-1 py-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                  style={{
                    lineHeight: 1,
                    fontSize: '1em',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowReferralInfo(false)}
                  aria-label="Close"
                  type="button"
                >
                  ×
                </button>
                <strong>How Referrals Work:</strong>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Share your unique referral link with colleagues.</li>
                  <li>For every 3 providers who subscribe, you get 1 month free.</li>
                  <li>You can track your referral progress here.</li>
                </ul>
              </div>
            )}
            {!showReferralInfo && (
              <button
                className="text-xs text-blue-600 dark:text-blue-300 font-medium underline cursor-pointer select-none mt-8 mb-1 text-left"
                style={{ alignSelf: "flex-start" }}
                onClick={() => setShowReferralInfo(true)}
                type="button"
              >
                Learn More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// TemplateUploadSection component for "Templates Page"
function TemplateUploadSection({ menuPage, setMenuPage, tabIndex, ...rest }) {
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const [templateText, setTemplateText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Acceptable file types
  const acceptedFileTypes = ".doc,.docx,.pdf,.jpg,.jpeg,.png";

  // Placeholder upload function
  const onUploadTemplate = (files, text) => {
    // TODO: Implement backend integration
    // For now, just log
    console.log("Uploading templates:", files, text);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    onUploadTemplate(selectedFiles, templateText);
    setSubmitting(false);
    setSelectedFiles([]);
    setTemplateText("");
  };

  // Cancel handler
  const handleCancel = () => {
    setSelectedFiles([]);
    setTemplateText("");
  };

  return (
    <div
      className={`absolute top-0 left-full w-full transition-transform duration-500 ease-in-out ${menuPage === "templates" ? "-translate-x-full opacity-100 pointer-events-auto" : "translate-x-0 opacity-0 pointer-events-none"}`}
      aria-hidden={menuPage !== "templates"}
      tabIndex={typeof tabIndex === "undefined" ? (menuPage === "templates" ? 0 : -1) : tabIndex}
      {...rest}
    >
      <div className="p-0 pt-0 text-gray-800 dark:text-white w-full">
        <div
          onClick={() => setMenuPage("main")}
          className="text-blue-500 cursor-pointer font-semibold transform transition-transform duration-200 hover:scale-105 px-6 pt-6"
        >
          ← Back
        </div>
        <div className="px-6 pt-4 pb-6 w-full">
          <div className="text-lg font-semibold mb-2">Upload Templates</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Upload your preferred SOAP note templates here (Word, PDF, image, or free text). Aerho will match your future notes to your style. Uploading a new set will replace your previous templates.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Upload Files (Word, PDF, Images):</label>
              <input
                type="file"
                accept={acceptedFileTypes}
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 dark:text-gray-300"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx}>{file.name}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Or paste template as free text:</label>
              <textarea
                rows={4}
                value={templateText}
                onChange={e => setTemplateText(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-md text-sm"
                placeholder="Paste your template here..."
              />
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-4 font-semibold">
              <span className="inline-block align-middle mr-1">⚠️</span>
              Uploading new templates will replace your previous set.
            </div>
                <div className="flex justify-end mt-auto">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
          </form>
        </div>
      </div>
    </div>
  );
}