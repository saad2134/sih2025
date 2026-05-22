export interface FAQItem {
  question: string;
  answer: string;
  value?: string;
}

export const faqConfig: FAQItem[] = [
  {
    question: "What is the purpose of this AI-powered learning path generator?",
    answer: "It helps learners discover personalized vocational training paths aligned to their background, skills, and career goals, dynamically updating as they progress or job market demands change.",
  },
  {
    question: "How does the system create personalized learning paths?",
    answer: "Using AI/ML, it analyzes learner profiles including education, skills, social context, and aspirations, then matches requirements with NSQF-aligned courses and industry needs.",
  },
  {
    question: "Who can use this platform?",
    answer: "Learners seeking career guidance, trainers monitoring learner progress, and policymakers tracking skill demand and training outcomes.",
  },
  {
    question: "Is this platform accessible in multiple languages?",
    answer: "Yes, it supports several Indian languages with simple, inclusive UI designed for easy mobile use.",
  },
  {
    question: "How does the platform ensure alignment with current job market needs?",
    answer: "It continuously integrates real-time labor market data to adjust course and skill recommendations.",
  },
  {
    question: "What types of training and credentials are recommended?",
    answer: "Vocational courses, micro-credentials, certifications, internships, apprenticeships, and on-the-job training opportunities.",
  },
  {
    question: "Can trainers and policymakers access learner progress and skill demand data?",
    answer: "Yes, dedicated dashboards provide progress insights for trainers and demand-supply analytics for policymakers.",
  },
  {
    question: "Is this solution scalable to handle millions of learners?",
    answer: "The system is designed with scalable architecture to manage large user volumes efficiently.",
  },
];
