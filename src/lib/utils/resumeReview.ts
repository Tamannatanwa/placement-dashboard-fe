/**
 * Automated Resume and Project Review System
 * Analyzes resume structure and projects to generate scores and reviews
 */

export interface ResumeReview {
  structure: string; // Review of resume structure
  projects: string; // Review of projects mentioned
  structureScore: number; // Score out of 10 for structure
  projectsScore: number; // Score out of 10 for projects
  difficulty: "easy" | "medium" | "hard"; // Project difficulty level
}

/**
 * Analyze resume structure automatically
 * Checks for key sections and formatting
 */
export function analyzeResumeStructure(resumeText: string, resumeLink?: string): { structure: string; score: number } {
  if (!resumeText && !resumeLink) {
    return {
      structure: "No resume provided",
      score: 0,
    };
  }

  const text = resumeText?.toLowerCase() || "";
  const link = resumeLink?.toLowerCase() || "";
  const combined = `${text} ${link}`;

  let score = 5; // Base score
  const issues: string[] = [];
  const strengths: string[] = [];

  // Check for key sections
  const sections = {
    contact: /contact|email|phone|address/i.test(combined),
    education: /education|degree|university|college/i.test(combined),
    experience: /experience|work|employment|internship/i.test(combined),
    skills: /skills|technical|programming|tools/i.test(combined),
    projects: /projects|project/i.test(combined),
  };

  // Score based on sections found
  if (sections.contact) {
    score += 1;
    strengths.push("Contact information present");
  } else {
    issues.push("Missing contact information");
  }

  if (sections.education) {
    score += 1;
    strengths.push("Education section present");
  } else {
    issues.push("Missing education section");
  }

  if (sections.experience) {
    score += 1;
    strengths.push("Experience section present");
  } else {
    issues.push("Missing experience section");
  }

  if (sections.skills) {
    score += 1;
    strengths.push("Skills section present");
  } else {
    issues.push("Missing skills section");
  }

  if (sections.projects) {
    score += 1;
    strengths.push("Projects section present");
  } else {
    issues.push("Missing projects section");
  }

  // Check for resume link
  if (resumeLink && (resumeLink.includes("http") || resumeLink.includes(".pdf") || resumeLink.includes(".doc"))) {
    score += 0.5;
    strengths.push("Resume link provided");
  }

  // Ensure score is between 0-10
  score = Math.min(10, Math.max(0, Math.round(score * 10) / 10));

  // Generate review text
  let review = "";
  if (strengths.length > 0) {
    review += `Strengths: ${strengths.join(", ")}. `;
  }
  if (issues.length > 0) {
    review += `Areas for improvement: ${issues.join(", ")}.`;
  }
  if (!review) {
    review = "Basic resume structure detected. Consider adding more detailed sections.";
  }

  return {
    structure: review,
    score,
  };
}

/**
 * Analyze projects automatically
 * Checks project descriptions, technologies, and complexity
 */
export function analyzeProjects(projectsText: string): { projects: string; score: number; difficulty: "easy" | "medium" | "hard" } {
  if (!projectsText || projectsText.trim() === "") {
    return {
      projects: "No projects mentioned",
      score: 0,
      difficulty: "easy",
    };
  }

  const text = projectsText.toLowerCase();
  let score = 5; // Base score
  const observations: string[] = [];

  // Check for project indicators
  const hasMultipleProjects = (projectsText.match(/project|app|website|system|application/gi) || []).length > 1;
  const hasTechnologies = /react|node|python|java|javascript|sql|database|api|frontend|backend/i.test(text);
  const hasDescription = text.length > 100; // Has substantial description
  const hasTechnologiesList = /tech stack|technologies|tools|framework/i.test(text);
  const hasGitHub = /github|git|repository|repo/i.test(text);
  const hasDeployment = /deploy|host|live|url|link/i.test(text);

  // Score calculation
  if (hasMultipleProjects) {
    score += 1.5;
    observations.push("Multiple projects mentioned");
  }

  if (hasTechnologies) {
    score += 1.5;
    observations.push("Technologies specified");
  }

  if (hasDescription) {
    score += 1;
    observations.push("Detailed project descriptions");
  }

  if (hasTechnologiesList) {
    score += 0.5;
    observations.push("Tech stack clearly listed");
  }

  if (hasGitHub) {
    score += 0.5;
    observations.push("GitHub/repository links provided");
  }

  if (hasDeployment) {
    score += 0.5;
    observations.push("Deployed projects mentioned");
  }

  // Determine difficulty based on technologies and complexity
  let difficulty: "easy" | "medium" | "hard" = "easy";
  const advancedTech = /machine learning|ml|ai|blockchain|microservices|docker|kubernetes|aws|cloud/i.test(text);
  const intermediateTech = /react|node|express|database|api|backend|frontend/i.test(text);
  
  if (advancedTech && hasMultipleProjects) {
    difficulty = "hard";
    score += 1;
  } else if (intermediateTech || hasMultipleProjects) {
    difficulty = "medium";
  }

  // Ensure score is between 0-10
  score = Math.min(10, Math.max(0, Math.round(score * 10) / 10));

  // Generate review text
  let review = "";
  if (observations.length > 0) {
    review += `Project highlights: ${observations.join(", ")}. `;
  }
  
  if (difficulty === "hard") {
    review += "Projects demonstrate advanced complexity and technical depth.";
  } else if (difficulty === "medium") {
    review += "Projects show good technical understanding and practical application.";
  } else {
    review += "Projects provide basic technical exposure.";
  }

  if (!review) {
    review = "Projects mentioned but need more detail on technologies and implementation.";
  }

  return {
    projects: review,
    score,
    difficulty,
  };
}

/**
 * Perform automated review of student resume and projects
 */
export function performAutomatedReview(
  resumeText?: string,
  resumeLink?: string,
  projectsText?: string
): ResumeReview {
  const structureAnalysis = analyzeResumeStructure(resumeText || "", resumeLink);
  const projectsAnalysis = analyzeProjects(projectsText || "");

  return {
    structure: structureAnalysis.structure,
    projects: projectsAnalysis.projects,
    structureScore: structureAnalysis.score,
    projectsScore: projectsAnalysis.score,
    difficulty: projectsAnalysis.difficulty,
  };
}





