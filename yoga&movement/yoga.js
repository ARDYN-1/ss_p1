/**
 * SoulSpace — Yoga & Light Exercise (yoga.js)
 * Vanilla JavaScript implementation for dynamic practice selection,
 * step-by-step guided routine, working countdown timer, and reflections.
 */

// =========================================================================
// 1. YOUTUBE VIDEO CONFIGURATION
// Real, beginner-friendly, high-quality stretching & gentle yoga videos.
// =========================================================================
const practiceVideos = {
  morningStretch: "https://www.youtube.com/watch?v=4C-gxOE0j7s",
  deskBreak: "https://www.youtube.com/watch?v=tAUf7aajBWE",
  gentleYoga: "https://www.youtube.com/watch?v=lxuTCHJSers",
  backRelaxation: "https://www.youtube.com/watch?v=Ho9em79_0qg"
};

// =========================================================================
// 2. PRACTICES DATA DEFINITION
// =========================================================================
const practicesData = {
  deskBreak: {
    id: "deskBreak",
    title: "5-Minute Desk Break",
    subtitle: "Release tension. Move gently.",
    durationText: "5 min",
    icon: "💻",
    videoTag: "5 min • Desk Break",
    videoUrl: practiceVideos.deskBreak,
    steps: [
      {
        number: "01",
        title: "Neck Movement",
        description: "Move slowly from side to side while keeping your shoulders relaxed.",
        durationSec: 30,
        icon: "🌱",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="55" ry="12" fill="#E2EBE2" opacity="0.6"/>
            <!-- Torso seated in chair -->
            <path d="M85 160 C85 130, 95 110, 120 110 C145 110, 155 130, 155 160" fill="#D6CBE3" opacity="0.9"/>
            <path d="M115 112 L115 88 C115 85, 125 85, 125 88 L125 112" stroke="#F1D2C2" stroke-width="8" stroke-linecap="round"/>
            <!-- Gently tilted head -->
            <ellipse cx="127" cy="72" rx="16" ry="19" transform="rotate(18 127 72)" fill="#F5DDD0"/>
            <ellipse cx="132" cy="62" rx="14" ry="12" fill="#2E2827"/>
            <!-- Gentle motion arcs -->
            <path d="M96 68 C100 58, 108 52, 116 50" stroke="#7A9782" stroke-width="1.8" stroke-dasharray="3 3" fill="none"/>
            <path d="M144 50 C152 52, 160 58, 164 68" stroke="#7A9782" stroke-width="1.8" stroke-dasharray="3 3" fill="none"/>
          </svg>
        `
      },
      {
        number: "02",
        title: "Shoulder Rolls",
        description: "Roll your shoulders upward, back, and gently down with your breath.",
        durationSec: 30,
        icon: "✨",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="55" ry="12" fill="#E2EBE2" opacity="0.6"/>
            <path d="M80 160 C80 125, 95 105, 120 105 C145 105, 160 125, 160 160" fill="#D6CBE3"/>
            <!-- Head upright -->
            <path d="M120 105 L120 86" stroke="#F1D2C2" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="120" cy="70" rx="15" ry="18" fill="#F5DDD0"/>
            <ellipse cx="120" cy="60" rx="14" ry="12" fill="#2E2827"/>
            <!-- Rotating shoulder energy circles -->
            <circle cx="88" cy="118" r="14" stroke="#7A9782" stroke-width="1.8" stroke-dasharray="4 3" fill="none"/>
            <polygon points="96,112 102,118 96,124" fill="#7A9782"/>
            <circle cx="152" cy="118" r="14" stroke="#7A9782" stroke-width="1.8" stroke-dasharray="4 3" fill="none"/>
            <polygon points="144,112 138,118 144,124" fill="#7A9782"/>
          </svg>
        `
      },
      {
        number: "03",
        title: "Wrist Movement",
        description: "Circle your wrists gently in both directions to release desk and typing strain.",
        durationSec: 30,
        icon: "🌿",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="55" ry="12" fill="#E2EBE2" opacity="0.6"/>
            <!-- Arms extended forward with relaxed palms circling -->
            <path d="M90 155 C90 125, 100 115, 120 115 C140 115, 150 125, 150 155" fill="#D6CBE3"/>
            <ellipse cx="120" cy="74" rx="14" ry="17" fill="#F5DDD0"/>
            <ellipse cx="120" cy="64" rx="13" ry="11" fill="#2E2827"/>
            <!-- Arms extending -->
            <path d="M96 122 Q105 105 110 90" stroke="#F1D2C2" stroke-width="7" stroke-linecap="round"/>
            <path d="M144 122 Q135 105 130 90" stroke="#F1D2C2" stroke-width="7" stroke-linecap="round"/>
            <!-- Wrist circular rotation markers -->
            <circle cx="110" cy="85" r="12" stroke="#7A9782" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
            <circle cx="130" cy="85" r="12" stroke="#7A9782" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
          </svg>
        `
      },
      {
        number: "04",
        title: "Tadasana",
        description: "Stand tall with grounded feet, an open chest, and steady calm breathing.",
        durationSec: 45,
        icon: "🏔️",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="168" rx="40" ry="8" fill="#E2EBE2" opacity="0.6"/>
            <!-- Legs standing straight & tall -->
            <path d="M114 165 L114 115 L126 115 L126 165" stroke="#557158" stroke-width="9" stroke-linecap="round"/>
            <!-- Torso -->
            <path d="M106 115 C106 85, 110 75, 120 75 C130 75, 134 85, 134 115 Z" fill="#D6CBE3"/>
            <!-- Head & Crown lifting upward -->
            <ellipse cx="120" cy="54" rx="12" ry="14" fill="#F5DDD0"/>
            <ellipse cx="120" cy="46" rx="12" ry="9" fill="#2E2827"/>
            <!-- Upward energy arrows -->
            <path d="M120 34 L120 22 M116 26 L120 22 L124 26" stroke="#557158" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `
      },
      {
        number: "05",
        title: "Gentle Forward Stretch",
        description: "Hinge softly at the hips, releasing tension along your spine and lower back.",
        durationSec: 45,
        icon: "🌸",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="168" rx="45" ry="9" fill="#E2EBE2" opacity="0.6"/>
            <!-- Soft bent knees -->
            <path d="M135 165 L140 125 L125 105" stroke="#557158" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Torso hinged forward -->
            <path d="M125 105 C115 105, 100 115, 95 130" stroke="#D6CBE3" stroke-width="12" stroke-linecap="round"/>
            <!-- Head relaxed down -->
            <ellipse cx="90" cy="140" rx="11" ry="13" fill="#F5DDD0"/>
            <ellipse cx="88" cy="142" rx="11" ry="9" fill="#2E2827"/>
            <!-- Relaxed hanging arms -->
            <path d="M105 118 L96 155" stroke="#F1D2C2" stroke-width="6" stroke-linecap="round"/>
          </svg>
        `
      }
    ]
  },

  morningStretch: {
    id: "morningStretch",
    title: "Morning Stretch Routine",
    subtitle: "Wake up your body gently.",
    durationText: "5–7 min",
    icon: "🌿",
    videoTag: "5–7 min • Morning Stretch",
    videoUrl: practiceVideos.morningStretch,
    steps: [
      {
        number: "01",
        title: "Gentle Neck Release",
        description: "Tilt your head gently from right to left, softening your jaw and shoulders.",
        durationSec: 30,
        icon: "🌱",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="50" ry="10" fill="#E2EBE2" opacity="0.6"/>
            <path d="M90 160 C90 130, 100 110, 120 110 C140 110, 150 130, 150 160" fill="#A8C3AF"/>
            <ellipse cx="125" cy="72" rx="15" ry="18" transform="rotate(15 125 72)" fill="#F5DDD0"/>
            <ellipse cx="129" cy="62" rx="13" ry="11" fill="#2E2827"/>
            <path d="M100 66 C105 56, 114 52, 122 50" stroke="#7A9782" stroke-width="1.8" stroke-dasharray="3 3" fill="none"/>
          </svg>
        `
      },
      {
        number: "02",
        title: "Cat-Cow Spine Awakening",
        description: "Inhale arching your spine gently, exhale rounding your back to release overnight stiffness.",
        durationSec: 45,
        icon: "✨",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="65" ry="10" fill="#E2EBE2" opacity="0.6"/>
            <!-- On hands and knees with gentle spine curve -->
            <path d="M70 160 L70 120 M170 160 L170 120" stroke="#F1D2C2" stroke-width="7" stroke-linecap="round"/>
            <path d="M70 120 Q120 135 170 120" stroke="#557158" stroke-width="12" stroke-linecap="round"/>
            <ellipse cx="60" cy="115" rx="12" ry="14" fill="#F5DDD0"/>
          </svg>
        `
      },
      {
        number: "03",
        title: "Overhead Morning Reach",
        description: "Interlace your fingers, press your palms toward the sky, and lengthen your entire spine.",
        durationSec: 30,
        icon: "☀️",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="168" rx="40" ry="8" fill="#E2EBE2" opacity="0.6"/>
            <path d="M114 165 L114 115 L126 115 L126 165" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <path d="M110 115 L110 75 L130 75 L130 115 Z" fill="#D6CBE3"/>
            <ellipse cx="120" cy="62" rx="11" ry="13" fill="#F5DDD0"/>
            <!-- Arms reaching overhead -->
            <path d="M106 78 L114 30 L126 30 L134 78" stroke="#F1D2C2" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `
      },
      {
        number: "04",
        title: "Standing Side Stretch",
        description: "Extend one arm overhead, leaning gently to the opposite side to open the ribcage.",
        durationSec: 45,
        icon: "🌿",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="168" rx="40" ry="8" fill="#E2EBE2" opacity="0.6"/>
            <path d="M115 165 L115 115 L125 115 L125 165" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <path d="M120 115 Q115 90 108 72" stroke="#D6CBE3" stroke-width="12" stroke-linecap="round"/>
            <ellipse cx="104" cy="62" rx="11" ry="13" fill="#F5DDD0"/>
            <!-- Arm curving in arc overhead -->
            <path d="M118 78 Q110 40 88 42" stroke="#F1D2C2" stroke-width="6" stroke-linecap="round"/>
          </svg>
        `
      },
      {
        number: "05",
        title: "Soft Forward Fold",
        description: "Bend your knees softly and let your upper body hang loose, breathing into your back.",
        durationSec: 60,
        icon: "🌸",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="168" rx="45" ry="9" fill="#E2EBE2" opacity="0.6"/>
            <path d="M135 165 L140 125 L125 105" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <path d="M125 105 C115 105, 100 115, 95 130" stroke="#D6CBE3" stroke-width="12" stroke-linecap="round"/>
            <ellipse cx="90" cy="140" rx="11" ry="13" fill="#F5DDD0"/>
            <path d="M105 118 L96 155" stroke="#F1D2C2" stroke-width="6" stroke-linecap="round"/>
          </svg>
        `
      }
    ]
  },

  gentleYoga: {
    id: "gentleYoga",
    title: "10-Minute Gentle Yoga",
    subtitle: "Slow, mindful movement.",
    durationText: "10 min",
    icon: "🧘",
    videoTag: "10 min • Gentle Yoga",
    videoUrl: practiceVideos.gentleYoga,
    steps: [
      {
        number: "01",
        title: "Centering Breath & Mountain",
        description: "Root down through your feet, lengthen through your crown, and notice your natural rhythm.",
        durationSec: 60,
        icon: "🏔️",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="168" rx="40" ry="8" fill="#E2EBE2" opacity="0.6"/>
            <path d="M114 165 L114 115 L126 115 L126 165" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <path d="M106 115 C106 85, 110 75, 120 75 C130 75, 134 85, 134 115 Z" fill="#D6CBE3"/>
            <ellipse cx="120" cy="54" rx="12" ry="14" fill="#F5DDD0"/>
          </svg>
        `
      },
      {
        number: "02",
        title: "Gentle Sun Salutation Flow",
        description: "Flow slowly between reaching upward and folding forward at your own natural pace.",
        durationSec: 60,
        icon: "☀️",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="80" r="45" fill="#FFFBF0" opacity="0.6"/>
            <path d="M90 160 L110 110 L130 110 L150 160" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <path d="M120 110 L120 65" stroke="#D6CBE3" stroke-width="12" stroke-linecap="round"/>
            <path d="M100 45 L120 68 L140 45" stroke="#F1D2C2" stroke-width="6" stroke-linecap="round"/>
          </svg>
        `
      },
      {
        number: "03",
        title: "Low Lunge Hip Release",
        description: "Step one foot forward into a soft low lunge, feeling a gentle opening through the hip.",
        durationSec: 60,
        icon: "🌿",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="60" ry="10" fill="#E2EBE2" opacity="0.6"/>
            <path d="M60 160 L90 120 L130 120 L160 160" stroke="#557158" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M130 120 L130 80" stroke="#D6CBE3" stroke-width="11" stroke-linecap="round"/>
            <ellipse cx="130" cy="65" rx="11" ry="13" fill="#F5DDD0"/>
          </svg>
        `
      },
      {
        number: "04",
        title: "Seated Gentle Twist",
        description: "Sit tall and twist softly to one side, letting each exhalation release torso tension.",
        durationSec: 60,
        icon: "✨",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="50" ry="10" fill="#E2EBE2" opacity="0.6"/>
            <!-- Cross-legged seated figure -->
            <path d="M85 160 Q120 145 155 160" stroke="#557158" stroke-width="10" stroke-linecap="round"/>
            <path d="M120 150 L120 100" stroke="#D6CBE3" stroke-width="11" stroke-linecap="round"/>
            <ellipse cx="120" cy="85" rx="12" ry="14" fill="#F5DDD0"/>
            <path d="M102 98 Q118 90 134 105" stroke="#7A9782" stroke-width="1.8" stroke-dasharray="3 3" fill="none"/>
          </svg>
        `
      },
      {
        number: "05",
        title: "Savasana Rest & Integration",
        description: "Lie or sit comfortably in still surrender, observing the calm stillness inside you.",
        durationSec: 90,
        icon: "🤍",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="155" rx="75" ry="8" fill="#E2EBE2" opacity="0.7"/>
            <path d="M70 150 L170 150" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="178" cy="148" rx="10" ry="8" fill="#F5DDD0"/>
            <!-- Soft restful floating aura -->
            <circle cx="120" cy="130" r="30" fill="#EAE5F2" opacity="0.45"/>
          </svg>
        `
      }
    ]
  },

  backRelaxation: {
    id: "backRelaxation",
    title: "Back Relaxation Practice",
    subtitle: "Gentle movements to unwind.",
    durationText: "5 min",
    icon: "🌸",
    videoTag: "5 min • Back Relaxation",
    videoUrl: practiceVideos.backRelaxation,
    steps: [
      {
        number: "01",
        title: "Knee-to-Chest Hug",
        description: "Lie down comfortably and bring your knees toward your chest, rocking gently from side to side.",
        durationSec: 30,
        icon: "🤍",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="158" rx="70" ry="10" fill="#E2EBE2" opacity="0.6"/>
            <!-- Supine knees hugging -->
            <path d="M80 150 L140 150" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <circle cx="120" cy="132" r="16" fill="#D6CBE3"/>
            <ellipse cx="70" cy="148" rx="10" ry="8" fill="#F5DDD0"/>
          </svg>
        `
      },
      {
        number: "02",
        title: "Cat-Cow Spinal Wave",
        description: "Gently articulate each vertebra with your slow in-and-out breaths.",
        durationSec: 45,
        icon: "🌊",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="65" ry="10" fill="#E2EBE2" opacity="0.6"/>
            <path d="M70 160 L70 120 M170 160 L170 120" stroke="#F1D2C2" stroke-width="7" stroke-linecap="round"/>
            <path d="M70 120 Q120 105 170 120" stroke="#557158" stroke-width="12" stroke-linecap="round"/>
            <ellipse cx="60" cy="115" rx="12" ry="14" fill="#F5DDD0"/>
          </svg>
        `
      },
      {
        number: "03",
        title: "Gentle Child's Pose",
        description: "Rest your hips back toward your heels and melt your forehead toward the mat.",
        durationSec: 60,
        icon: "🍃",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="60" ry="9" fill="#E2EBE2" opacity="0.6"/>
            <!-- Folded child pose -->
            <path d="M150 160 C150 140, 130 140, 110 148 C95 152, 80 155, 75 160" stroke="#557158" stroke-width="12" stroke-linecap="round"/>
            <ellipse cx="70" cy="155" rx="11" ry="9" fill="#F5DDD0"/>
            <path d="M90 155 L60 158" stroke="#F1D2C2" stroke-width="5" stroke-linecap="round"/>
          </svg>
        `
      },
      {
        number: "04",
        title: "Supine Spinal Twist",
        description: "Drop your knees gently to one side, opening your opposite arm and gazing toward the ceiling.",
        durationSec: 45,
        icon: "🌸",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="158" rx="65" ry="9" fill="#E2EBE2" opacity="0.6"/>
            <path d="M80 152 L140 152" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <path d="M130 150 Q145 135 155 142" stroke="#D6CBE3" stroke-width="9" stroke-linecap="round"/>
            <ellipse cx="72" cy="150" rx="9" ry="8" fill="#F5DDD0"/>
          </svg>
        `
      },
      {
        number: "05",
        title: "Legs-Up Resting Pose",
        description: "Relax your lower back flat onto the surface, letting all weight and tension dissolve.",
        durationSec: 60,
        icon: "✨",
        visualSvg: `
          <svg viewBox="0 0 240 180" class="pose-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="165" rx="65" ry="8" fill="#E2EBE2" opacity="0.6"/>
            <!-- Flat back with legs elevated -->
            <path d="M70 160 L130 160" stroke="#D6CBE3" stroke-width="10" stroke-linecap="round"/>
            <path d="M130 160 L130 110" stroke="#557158" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="62" cy="158" rx="10" ry="8" fill="#F5DDD0"/>
          </svg>
        `
      }
    ]
  }
};

// =========================================================================
// 3. APPLICATION STATE
// =========================================================================
const state = {
  currentPracticeId: "deskBreak",
  currentStepIndex: 0,
  timeRemaining: 30,
  totalStepDuration: 30,
  isRunning: false,
  timerInterval: null
};

// Constant for circular timer progress ring
const CIRCLE_RADIUS = 68;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // approx 427.26

// LocalStorage key for reflections (consistent across SoulSpace)
const STORAGE_KEY = "soulspace_reflections";

// =========================================================================
// 4. DOM REFERENCES
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const practiceCards = document.querySelectorAll(".practice-card");
  const cardStartButtons = document.querySelectorAll(".btn-card-start");

  // Feature Section Elements
  const featureIconBadge = document.getElementById("featureIconBadge");
  const featureTitle = document.getElementById("featureTitle");
  const featureSubtitle = document.getElementById("featureSubtitle");
  const featureDurationText = document.getElementById("featureDurationText");
  const featureYoutubeLink = document.getElementById("featureYoutubeLink");
  const visualMediaBox = document.getElementById("visualMediaBox");
  const poseSvgWrapper = document.getElementById("poseSvgWrapper");
  const mediaDurationTag = document.getElementById("mediaDurationTag");

  // Routine Steps
  const stepCounterText = document.getElementById("stepCounterText");
  const stepsProgressFill = document.getElementById("stepsProgressFill");
  const stepsListContainer = document.getElementById("stepsListContainer");

  // Practice Mode
  const currentStepPill = document.getElementById("currentStepPill");
  const stepMiniIcon = document.getElementById("stepMiniIcon");
  const currentStepInstruction = document.getElementById("currentStepInstruction");
  const timerCircleProgress = document.getElementById("timerCircleProgress");
  const timerDigits = document.getElementById("timerDigits");
  const btnPause = document.getElementById("btnPause");
  const pauseBtnText = document.getElementById("pauseBtnText");
  const pauseBtnIcon = document.getElementById("pauseBtnIcon");
  const btnNext = document.getElementById("btnNext");
  const nextBtnText = document.getElementById("nextBtnText");
  const btnResetStep = document.getElementById("btnResetStep");

  // Completion View & Grids
  const featureBodyGrid = document.getElementById("featureBodyGrid");
  const completionView = document.getElementById("completionView");
  const practiceReflectionInput = document.getElementById("practiceReflectionInput");
  const btnSaveReflection = document.getElementById("btnSaveReflection");
  const btnRestartRoutine = document.getElementById("btnRestartRoutine");

  // Navigation & Modals
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMobile = document.getElementById("navMobile");
  const navReflectionsBtn = document.getElementById("navReflectionsBtn");
  const navMobileReflections = document.getElementById("navMobileReflections");
  const reflectionsModal = document.getElementById("reflectionsModal");
  const btnCloseReflections = document.getElementById("btnCloseReflections");
  const btnDismissReflections = document.getElementById("btnDismissReflections");
  const btnClearReflections = document.getElementById("btnClearReflections");
  const modalReflectionsList = document.getElementById("modalReflectionsList");
  const toastNotification = document.getElementById("toastNotification");
  const toastMessage = document.getElementById("toastMessage");

  // =========================================================================
  // 5. PRACTICE SELECTION & INITIALIZATION
  // =========================================================================
  
  /**
   * Set up circular SVG circumference
   */
  if (timerCircleProgress) {
    timerCircleProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
    timerCircleProgress.style.strokeDashoffset = "0";
  }

  /**
   * Switch active practice
   * @param {string} practiceId
   * @param {boolean} autoStart
   * @param {boolean} smoothScroll
   */
  function selectPractice(practiceId, autoStart = false, smoothScroll = false) {
    if (!practicesData[practiceId]) return;

    state.currentPracticeId = practiceId;
    state.currentStepIndex = 0;
    pauseTimer();

    const practice = practicesData[practiceId];

    // 1. Update practice card visuals (active border & selection)
    practiceCards.forEach(card => {
      const isSelected = card.dataset.practice === practiceId;
      card.classList.toggle("active", isSelected);
      card.setAttribute("aria-checked", isSelected ? "true" : "false");
    });

    // 2. Update Feature Header
    featureIconBadge.textContent = practice.icon;
    featureTitle.textContent = practice.title;
    featureSubtitle.textContent = practice.subtitle;
    featureDurationText.textContent = practice.durationText;
    featureYoutubeLink.href = practice.videoUrl;
    mediaDurationTag.textContent = practice.videoTag;

    // 3. Reset View States
    completionView.style.display = "none";
    featureBodyGrid.style.display = "grid";

    // 4. Render Routine Steps in Column 2
    renderRoutineSteps(practice);

    // 5. Load First Step in Column 3
    loadStep(0);

    // 6. Smooth Scroll if requested
    if (smoothScroll) {
      const guidedSection = document.getElementById("guidedPracticeSection");
      if (guidedSection) {
        guidedSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // 7. Auto Start if user clicked "Start" button
    if (autoStart) {
      startTimer();
    }
  }

  /**
   * Render the list of 5 steps in the Routine Steps column
   */
  function renderRoutineSteps(practice) {
    stepsListContainer.innerHTML = "";

    practice.steps.forEach((step, idx) => {
      const stepRow = document.createElement("div");
      stepRow.className = `step-row-item ${idx === 0 ? "active" : ""}`;
      stepRow.dataset.stepIndex = idx;
      stepRow.setAttribute("role", "button");
      stepRow.setAttribute("tabindex", "0");
      stepRow.setAttribute("aria-label", `Step ${idx + 1}: ${step.title}`);

      stepRow.innerHTML = `
        <div class="step-number-badge">${step.number}</div>
        <span class="step-item-title">${step.title}</span>
      `;

      // Allow clicking any step to jump to it
      stepRow.addEventListener("click", () => {
        pauseTimer();
        loadStep(idx);
      });

      stepRow.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pauseTimer();
          loadStep(idx);
        }
      });

      stepsListContainer.appendChild(stepRow);
    });
  }

  /**
   * Load specific step into the interactive card and timer
   * @param {number} index
   */
  function loadStep(index) {
    const practice = practicesData[state.currentPracticeId];
    if (!practice || index < 0 || index >= practice.steps.length) return;

    state.currentStepIndex = index;
    const step = practice.steps[index];

    // Update Counter & Progress Bar
    const totalSteps = practice.steps.length;
    stepCounterText.textContent = `Step ${index + 1} of ${totalSteps}`;
    const progressPercent = ((index + 1) / totalSteps) * 100;
    stepsProgressFill.style.width = `${progressPercent}%`;

    // Highlight in Routine Steps list
    const stepRows = stepsListContainer.querySelectorAll(".step-row-item");
    stepRows.forEach((row, i) => {
      row.classList.toggle("active", i === index);
      row.classList.toggle("completed", i < index);
    });

    // Update Column 1 Visual Presentation
    poseSvgWrapper.innerHTML = step.visualSvg;

    // Update Column 3 Current Step Card
    currentStepPill.textContent = step.title;
    stepMiniIcon.textContent = step.icon;
    currentStepInstruction.textContent = step.description;

    // Update Next Button text on last step
    if (index === totalSteps - 1) {
      nextBtnText.textContent = "Finish";
    } else {
      nextBtnText.textContent = "Next";
    }

    // Reset Timer for this step
    state.totalStepDuration = step.durationSec;
    state.timeRemaining = step.durationSec;
    updateTimerDisplay();
  }

  // =========================================================================
  // 6. TIMER LOGIC & CONTROLS
  // =========================================================================

  /**
   * Format seconds to MM:SS
   */
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMins = String(mins).padStart(2, "0");
    const formattedSecs = String(secs).padStart(2, "0");
    return `${formattedMins}:${formattedSecs}`;
  }

  /**
   * Update timer digits and circular stroke offset
   */
  function updateTimerDisplay() {
    timerDigits.textContent = formatTime(state.timeRemaining);

    // Update circular progress ring
    if (timerCircleProgress) {
      const fraction = state.timeRemaining / state.totalStepDuration;
      const offset = CIRCUMFERENCE * (1 - fraction);
      timerCircleProgress.style.strokeDashoffset = `${offset}`;
    }
  }

  /**
   * Start or resume the timer
   */
  function startTimer() {
    if (state.isRunning) return;

    state.isRunning = true;
    updatePauseButtonUI(true);

    state.timerInterval = setInterval(() => {
      if (state.timeRemaining > 0) {
        state.timeRemaining--;
        updateTimerDisplay();
      } else {
        // Step complete!
        handleStepComplete();
      }
    }, 1000);
  }

  /**
   * Pause the timer
   */
  function pauseTimer() {
    if (!state.isRunning) return;

    state.isRunning = false;
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    updatePauseButtonUI(false);
  }

  /**
   * Toggle pause / resume
   */
  function togglePause() {
    if (state.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  /**
   * Update Pause button text and icon
   */
  function updatePauseButtonUI(running) {
    if (running) {
      pauseBtnText.textContent = "Pause";
      pauseBtnIcon.innerHTML = `
        <rect x="4" y="3" width="3" height="10" rx="1"/>
        <rect x="9" y="3" width="3" height="10" rx="1"/>
      `;
    } else {
      pauseBtnText.textContent = "Resume";
      pauseBtnIcon.innerHTML = `
        <polygon points="5,3 13,8 5,13"/>
      `;
    }
  }

  /**
   * Move to the next step
   */
  function nextStep() {
    const practice = practicesData[state.currentPracticeId];
    if (!practice) return;

    if (state.currentStepIndex < practice.steps.length - 1) {
      const wasRunning = state.isRunning;
      pauseTimer();
      loadStep(state.currentStepIndex + 1);
      if (wasRunning) {
        startTimer();
      }
    } else {
      // Completed all steps
      handleRoutineComplete();
    }
  }

  /**
   * When a single step's timer reaches 00:00
   */
  function handleStepComplete() {
    const practice = practicesData[state.currentPracticeId];
    if (!practice) return;

    if (state.currentStepIndex < practice.steps.length - 1) {
      loadStep(state.currentStepIndex + 1);
      // continue timer automatically into the next gentle step
    } else {
      handleRoutineComplete();
    }
  }

  /**
   * Reset current step back to full duration
   */
  function resetStep() {
    pauseTimer();
    const practice = practicesData[state.currentPracticeId];
    const step = practice.steps[state.currentStepIndex];
    state.timeRemaining = step.durationSec;
    updateTimerDisplay();
  }

  /**
   * Routine finished: show peaceful completion screen
   */
  function handleRoutineComplete() {
    pauseTimer();
    featureBodyGrid.style.display = "none";
    completionView.style.display = "block";
    completionView.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // =========================================================================
  // 7. EVENT LISTENERS
  // =========================================================================

  // Practice Card Clicks
  practiceCards.forEach(card => {
    card.addEventListener("click", (e) => {
      // Don't trigger if clicked on the YouTube hyperlink or button directly
      if (e.target.closest(".watch-practice-link") || e.target.closest(".btn-card-start")) {
        return;
      }
      const practiceId = card.dataset.practice;
      selectPractice(practiceId, false, false);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (!e.target.closest(".watch-practice-link") && !e.target.closest(".btn-card-start")) {
          e.preventDefault();
          selectPractice(card.dataset.practice, false, true);
        }
      }
    });
  });

  // Start Buttons on Cards
  cardStartButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const practiceId = btn.dataset.start;
      selectPractice(practiceId, true, true);
    });
  });

  // Visual Media Box Click -> Open YouTube Video
  if (visualMediaBox) {
    visualMediaBox.addEventListener("click", () => {
      const practice = practicesData[state.currentPracticeId];
      if (practice && practice.videoUrl) {
        window.open(practice.videoUrl, "_blank", "noopener,noreferrer");
      }
    });

    visualMediaBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const practice = practicesData[state.currentPracticeId];
        if (practice && practice.videoUrl) {
          window.open(practice.videoUrl, "_blank", "noopener,noreferrer");
        }
      }
    });
  }

  // Timer Controls
  if (btnPause) {
    btnPause.addEventListener("click", togglePause);
  }

  if (btnNext) {
    btnNext.addEventListener("click", nextStep);
  }

  if (btnResetStep) {
    btnResetStep.addEventListener("click", resetStep);
  }

  // Completion Screen Buttons
  if (btnRestartRoutine) {
    btnRestartRoutine.addEventListener("click", () => {
      selectPractice(state.currentPracticeId, true, false);
    });
  }

  if (btnSaveReflection) {
    btnSaveReflection.addEventListener("click", () => {
      savePracticeReflection();
    });
  }

  // Mobile Hamburger Toggle
  if (hamburgerBtn && navMobile) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = navMobile.classList.toggle("open");
      hamburgerBtn.classList.toggle("active", isOpen);
      hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navMobile.setAttribute("aria-hidden", isOpen ? "false" : "true");
    });
  }

  // =========================================================================
  // 8. REFLECTIONS MODAL & LOCALSTORAGE (Shared SoulSpace Ecosystem)
  // =========================================================================
  
  function savePracticeReflection() {
    const practice = practicesData[state.currentPracticeId];
    const text = practiceReflectionInput.value.trim();

    const reflectionEntry = {
      id: Date.now(),
      practiceType: "Yoga & Movement",
      practiceTitle: practice ? practice.title : "Gentle Movement",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      text: text || "Completed with gentle awareness and calm breath."
    };

    let existing = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) existing = JSON.parse(stored);
    } catch (e) {
      existing = [];
    }

    existing.unshift(reflectionEntry);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }

    practiceReflectionInput.value = "";
    showToast("Practice saved to My Reflections ✨");

    // After saving, give option to restart or choose another
    btnSaveReflection.textContent = "Saved ✓";
    btnSaveReflection.disabled = true;
    setTimeout(() => {
      btnSaveReflection.textContent = "Save to My Reflections";
      btnSaveReflection.disabled = false;
    }, 2500);
  }

  function renderReflectionsList() {
    modalReflectionsList.innerHTML = "";
    let entries = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) entries = JSON.parse(stored);
    } catch (e) {
      entries = [];
    }

    if (!entries || entries.length === 0) {
      modalReflectionsList.innerHTML = `
        <p class="no-reflections-text">No reflections recorded yet.<br>Complete a gentle practice and take a moment to reflect.</p>
      `;
      return;
    }

    entries.forEach(item => {
      const el = document.createElement("div");
      el.className = "reflection-item";
      el.innerHTML = `
        <div class="reflection-meta">
          <span class="reflection-practice-name">${escapeHtml(item.practiceTitle || "Gentle Practice")}</span>
          <span class="reflection-date">${escapeHtml(item.date || "")}</span>
        </div>
        <p class="reflection-text">${escapeHtml(item.text)}</p>
      `;
      modalReflectionsList.appendChild(el);
    });
  }

  function openReflectionsModal() {
    renderReflectionsList();
    reflectionsModal.classList.add("open");
    reflectionsModal.setAttribute("aria-hidden", "false");
  }

  function closeReflectionsModal() {
    reflectionsModal.classList.remove("open");
    reflectionsModal.setAttribute("aria-hidden", "true");
  }

  if (navReflectionsBtn) {
    navReflectionsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openReflectionsModal();
    });
  }

  if (navMobileReflections) {
    navMobileReflections.addEventListener("click", (e) => {
      e.preventDefault();
      if (navMobile) navMobile.classList.remove("open");
      if (hamburgerBtn) hamburgerBtn.classList.remove("active");
      openReflectionsModal();
    });
  }

  if (btnCloseReflections) btnCloseReflections.addEventListener("click", closeReflectionsModal);
  if (btnDismissReflections) btnDismissReflections.addEventListener("click", closeReflectionsModal);

  if (reflectionsModal) {
    reflectionsModal.addEventListener("click", (e) => {
      if (e.target === reflectionsModal) {
        closeReflectionsModal();
      }
    });
  }

  if (btnClearReflections) {
    btnClearReflections.addEventListener("click", () => {
      if (confirm("Clear your saved mindful reflections?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderReflectionsList();
        showToast("Reflections history cleared");
      }
    });
  }

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = msg;
    toastNotification.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Keyboard shortcut: Esc closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && reflectionsModal.classList.contains("open")) {
      closeReflectionsModal();
    }
  });

  // Initial load: Default to 5-Minute Desk Break as shown in the SoulSpace mockup!
  selectPractice("deskBreak", false, false);
});
