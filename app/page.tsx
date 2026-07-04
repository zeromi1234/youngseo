"use client";

import { useState, useEffect } from "react";
import OnboardingScreen from "@/components/OnboardingScreen";
import LoadingScreen from "@/components/LoadingScreen";
import ReportScreen from "@/components/ReportScreen";
import SavedProfiles from "@/components/SavedProfiles";

export type UserData = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  yaJasi: boolean;
  siju: string;
  gender: "female" | "male";
  birthplace: string;
  tone: "soft" | "brutal";
  name?: string;
};

export type AnalysisResults = Record<string, string>;

export type AppStep = "onboarding" | "loading" | "report" | "profiles";

export default function Home() {
  const [step, setStep] = useState<AppStep>("onboarding");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>({});
  const [savedProfiles, setSavedProfiles] = useState<UserData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ys_profiles");
    if (saved) setSavedProfiles(JSON.parse(saved));
  }, []);

  const handleComplete = (data: UserData) => {
    setUserData(data);
    if (data.name) {
      const updated = [...savedProfiles, data];
      setSavedProfiles(updated);
      localStorage.setItem("ys_profiles", JSON.stringify(updated));
    }
    setStep("loading");
  };

  const handleLoadingDone = (results: AnalysisResults) => {
    setAnalysisResults(results);
    setStep("report");
  };

  const handleSaveProfile = (data: UserData, name: string) => {
    const updated = [...savedProfiles, { ...data, name }];
    setSavedProfiles(updated);
    localStorage.setItem("ys_profiles", JSON.stringify(updated));
  };

  const handleDeleteProfile = (index: number) => {
    const updated = savedProfiles.filter((_, i) => i !== index);
    setSavedProfiles(updated);
    localStorage.setItem("ys_profiles", JSON.stringify(updated));
  };

  const handleLoadProfile = (profile: UserData) => {
    setUserData(profile);
    setAnalysisResults({});
    setStep("loading");
  };

  if (step === "loading" && userData) {
    return <LoadingScreen userData={userData} onDone={handleLoadingDone} />;
  }

  if (step === "report" && userData) {
    return (
      <ReportScreen
        userData={userData}
        results={analysisResults}
        onBack={() => setStep("onboarding")}
        onSave={handleSaveProfile}
        onProfiles={() => setStep("profiles")}
      />
    );
  }

  if (step === "profiles") {
    return (
      <SavedProfiles
        profiles={savedProfiles}
        onBack={() => setStep("onboarding")}
        onLoad={handleLoadProfile}
        onDelete={handleDeleteProfile}
      />
    );
  }

  return (
    <OnboardingScreen
      onComplete={handleComplete}
      onProfiles={() => setStep("profiles")}
      hasProfiles={savedProfiles.length > 0}
    />
  );
}
