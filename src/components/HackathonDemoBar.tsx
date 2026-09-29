import React, { useState } from 'react';
import { useDemo, HACKATHON_DEMO_STEPS } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, Sparkles, RotateCcw, List, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HackathonDemoBarProps {
  onNavigate: (path: string) => void;
}

export const HackathonDemoBar: React.FC<HackathonDemoBarProps> = ({ onNavigate }) => {
  const {
    currentStepIndex,
    currentStep,
    goToNextStep,
    goToPrevStep,
    jumpToStep,
    isTourOpen,
    setIsTourOpen,
    resetDemoData
  } = useDemo();
  const { currentUser, switchUser, switchRole } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);

  const handleStepAction = () => {
    if (currentStep.roleRequired && currentStep.roleRequired !== currentUser.role) {
      switchRole(currentStep.roleRequired);
    }
    if (currentStep.targetPath) {
      onNavigate(currentStep.targetPath);
    }
  };

  if (!isTourOpen) {
    return (
      <button
        onClick={() => setIsTourOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-[#781F37] text-white px-3.5 py-2 rounded-full shadow-2xl hover:bg-[#5E182B] transition-all text-xs font-semibold cursor-pointer border border-[#E8E1D8]/30"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#C89228]" />
        <span>Hackathon Demo Guide ({currentStepIndex + 1}/{HACKATHON_DEMO_STEPS.length})</span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#18212B]/95 backdrop-blur-md text-white border-t border-[#E8E1D8]/20 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* Step Counter & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#781F37] text-[#FFF9F1] font-bold text-xs ring-2 ring-[#C89228]/50">
              {currentStep.stepNumber}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#C89228] font-bold">
                  Step {currentStep.stepNumber} of 16
                </span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-stone-300">
                  Role: {currentStep.roleRequired || 'Any'}
                </span>
              </div>
              <h4 className="text-sm font-semibold truncate text-[#FFF9F1]">
                {currentStep.title}
              </h4>
            </div>
          </div>

          {/* Step Instruction */}
          <p className="text-xs text-stone-300 max-w-xl hidden lg:block line-clamp-1 italic">
            "{currentStep.instruction}"
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleStepAction}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#197B5B] hover:bg-[#146349] text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
              title="Jump to this step's screen and activate required role"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Jump to Step Screen</span>
            </button>

            <button
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white transition cursor-pointer"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={goToNextStep}
              disabled={currentStepIndex === HACKATHON_DEMO_STEPS.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#781F37] hover:bg-[#5E182B] disabled:opacity-30 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
              title="Next Step"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
              title="View all 16 Demo Steps"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={resetDemoData}
              className="p-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg text-stone-300 transition cursor-pointer"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsTourOpen(false)}
              className="text-stone-400 hover:text-white text-xs px-1.5"
              title="Minimize Guide"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* 16-Step Drawer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-3 animate-fade-in">
          <div className="bg-[#18212B] text-white w-full max-w-2xl max-h-[80vh] rounded-2xl p-5 shadow-2xl border border-[#E8E1D8]/20 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C89228]" />
                <h3 className="font-serif-couture text-lg font-bold text-[#FFF9F1]">
                  ReWear Hackathon 16-Step Demo Roadmap
                </h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-stone-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1">
              {HACKATHON_DEMO_STEPS.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <div
                    key={step.stepNumber}
                    onClick={() => {
                      jumpToStep(idx);
                      if (step.roleRequired && step.roleRequired !== currentUser.role) {
                        switchRole(step.roleRequired);
                      }
                      if (step.targetPath) {
                        onNavigate(step.targetPath);
                      }
                      setShowDrawer(false);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#781F37]/30 border-[#781F37] ring-1 ring-[#C89228]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#197B5B]" />
                      ) : (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-[#C89228] text-black' : 'bg-white/10 text-stone-300'}`}>
                          {step.stepNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {step.title}
                        </h4>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider ml-2">
                          {step.roleRequired || 'Customer'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 mt-0.5">
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
              <span>Click any step to activate its view and role automatically.</span>
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium cursor-pointer"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
