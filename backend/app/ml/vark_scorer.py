from typing import List, Tuple


VARK_QUESTIONS = [
    {
        "id": "q1",
        "text": "When learning something new, you prefer to:",
        "options": [
            {"id": "q1_a", "label": "See diagrams, charts, or videos", "vark_dim": "V"},
            {"id": "q1_b", "label": "Listen to explanations", "vark_dim": "A"},
            {"id": "q1_c", "label": "Read written instructions", "vark_dim": "R"},
            {"id": "q1_d", "label": "Do hands-on practice", "vark_dim": "K"},
        ],
    },
    {
        "id": "q2",
        "text": "When solving a problem, you usually:",
        "options": [
            {
                "id": "q2_a",
                "label": "Visualize the solution in your mind",
                "vark_dim": "V",
            },
            {"id": "q2_b", "label": "Talk it through out loud", "vark_dim": "A"},
            {"id": "q2_c", "label": "Write down steps and logic", "vark_dim": "R"},
            {
                "id": "q2_d",
                "label": "Try different approaches practically",
                "vark_dim": "K",
            },
        ],
    },
    {
        "id": "q3",
        "text": "You are watching a tutorial. The best one would have:",
        "options": [
            {
                "id": "q3_a",
                "label": "Clear visuals and demonstrations",
                "vark_dim": "V",
            },
            {"id": "q3_b", "label": "Good verbal explanations", "vark_dim": "A"},
            {"id": "q3_c", "label": "Written notes and transcripts", "vark_dim": "R"},
            {"id": "q3_d", "label": "Exercises to follow along", "vark_dim": "K"},
        ],
    },
    {
        "id": "q4",
        "text": "When reviewing for an exam, you would most likely:",
        "options": [
            {"id": "q4_a", "label": "Create flashcards with images", "vark_dim": "V"},
            {
                "id": "q4_b",
                "label": "Record yourself explaining topics",
                "vark_dim": "A",
            },
            {"id": "q4_c", "label": "Rewrite notes in your own words", "vark_dim": "R"},
            {"id": "q4_d", "label": "Solve practice problems", "vark_dim": "K"},
        ],
    },
    {
        "id": "q5",
        "text": "A mentor explains a concept. You understand best when they:",
        "options": [
            {"id": "q5_a", "label": "Draw it out or show examples", "vark_dim": "V"},
            {"id": "q5_b", "label": "Explain verbally with examples", "vark_dim": "A"},
            {"id": "q5_c", "label": "Give you a document to read", "vark_dim": "R"},
            {"id": "q5_d", "label": "Let you try it yourself first", "vark_dim": "K"},
        ],
    },
    {
        "id": "q6",
        "text": "You prefer learning content that is:",
        "options": [
            {"id": "q6_a", "label": "Visual and graphical", "vark_dim": "V"},
            {"id": "q6_b", "label": "Audio or podcast-based", "vark_dim": "A"},
            {"id": "q6_c", "label": "Text-based with examples", "vark_dim": "R"},
            {"id": "q6_d", "label": "Interactive and practical", "vark_dim": "K"},
        ],
    },
    {
        "id": "q7",
        "text": "When following a recipe, you:",
        "options": [
            {"id": "q7_a", "label": "Look at photos of each step", "vark_dim": "V"},
            {"id": "q7_b", "label": "Watch a cooking video", "vark_dim": "A"},
            {
                "id": "q7_c",
                "label": "Read the written recipe carefully",
                "vark_dim": "R",
            },
            {
                "id": "q7_d",
                "label": "Just start cooking and figure it out",
                "vark_dim": "K",
            },
        ],
    },
    {
        "id": "q8",
        "text": "Your ideal online course has:",
        "options": [
            {"id": "q8_a", "label": "Lots of animations and diagrams", "vark_dim": "V"},
            {"id": "q8_b", "label": "Engaging audio narration", "vark_dim": "A"},
            {"id": "q8_c", "label": "Detailed reading material", "vark_dim": "R"},
            {"id": "q8_d", "label": "Coding exercises and labs", "vark_dim": "K"},
        ],
    },
    {
        "id": "q9",
        "text": "When learning a new software tool, you prefer to:",
        "options": [
            {"id": "q9_a", "label": "Watch someone use it in a video", "vark_dim": "V"},
            {"id": "q9_b", "label": "Listen to a podcast about it", "vark_dim": "A"},
            {"id": "q9_c", "label": "Read the documentation", "vark_dim": "R"},
            {"id": "q9_d", "label": "Open it and explore", "vark_dim": "K"},
        ],
    },
    {
        "id": "q10",
        "text": "During a team meeting, you contribute best by:",
        "options": [
            {
                "id": "q10_a",
                "label": "Using whiteboards or visual aids",
                "vark_dim": "V",
            },
            {"id": "q10_b", "label": "Speaking and discussing ideas", "vark_dim": "A"},
            {
                "id": "q10_c",
                "label": "Writing down structured proposals",
                "vark_dim": "R",
            },
            {
                "id": "q10_d",
                "label": "Demonstrating with practical examples",
                "vark_dim": "K",
            },
        ],
    },
    {
        "id": "q11",
        "text": "You remember information best when:",
        "options": [
            {
                "id": "q11_a",
                "label": "You can picture it in your mind",
                "vark_dim": "V",
            },
            {"id": "q11_b", "label": "You heard someone explain it", "vark_dim": "A"},
            {"id": "q11_c", "label": "You wrote it down or read it", "vark_dim": "R"},
            {
                "id": "q11_d",
                "label": "You physically did something with it",
                "vark_dim": "K",
            },
        ],
    },
    {
        "id": "q12",
        "text": "When debugging code, you usually:",
        "options": [
            {
                "id": "q12_a",
                "label": "Add print statements and visualize output",
                "vark_dim": "V",
            },
            {
                "id": "q12_b",
                "label": "Talk through the logic with someone",
                "vark_dim": "A",
            },
            {
                "id": "q12_c",
                "label": "Read through the code line by line",
                "vark_dim": "R",
            },
            {
                "id": "q12_d",
                "label": "Try different inputs and see what happens",
                "vark_dim": "K",
            },
        ],
    },
    {
        "id": "q13",
        "text": "For learning a new language, you would choose:",
        "options": [
            {"id": "q13_a", "label": "Visual flashcards with images", "vark_dim": "V"},
            {
                "id": "q13_b",
                "label": "Audio lessons and conversations",
                "vark_dim": "A",
            },
            {"id": "q13_c", "label": "Grammar books and reading", "vark_dim": "R"},
            {"id": "q13_d", "label": "Language exchange with natives", "vark_dim": "K"},
        ],
    },
    {
        "id": "q14",
        "text": "You find a concept clearest when explained with:",
        "options": [
            {"id": "q14_a", "label": "Diagrams and flowcharts", "vark_dim": "V"},
            {"id": "q14_b", "label": "Verbal stories and analogies", "vark_dim": "A"},
            {
                "id": "q14_c",
                "label": "Written formulas and derivations",
                "vark_dim": "R",
            },
            {
                "id": "q14_d",
                "label": "Real-world examples and practice",
                "vark_dim": "K",
            },
        ],
    },
    {
        "id": "q15",
        "text": "When taking notes during a lecture, you:",
        "options": [
            {"id": "q15_a", "label": "Draw mind maps and diagrams", "vark_dim": "V"},
            {
                "id": "q15_b",
                "label": "Focus on listening, minimal writing",
                "vark_dim": "A",
            },
            {"id": "q15_c", "label": "Write everything down in order", "vark_dim": "R"},
            {
                "id": "q15_d",
                "label": "Don't take notes, prefer to practice instead",
                "vark_dim": "K",
            },
        ],
    },
    {
        "id": "q16",
        "text": "Before starting a project, you first:",
        "options": [
            {
                "id": "q16_a",
                "label": "Create a visual plan or flowchart",
                "vark_dim": "V",
            },
            {
                "id": "q16_b",
                "label": "Discuss the plan with stakeholders",
                "vark_dim": "A",
            },
            {"id": "q16_c", "label": "Write a detailed document", "vark_dim": "R"},
            {
                "id": "q16_d",
                "label": "Start working and adjust along the way",
                "vark_dim": "K",
            },
        ],
    },
]


def compute_vark_scores(answers: List[dict]) -> Tuple[float, float, float, float]:
    v, a, r, k = 0.0, 0.0, 0.0, 0.0
    counts = {"V": 0, "A": 0, "R": 0, "K": 0}
    total = 0

    for answer in answers:
        dim = answer.get("vark_dim")
        if dim in counts:
            counts[dim] += 1
            total += 1

    if total == 0:
        return (0.25, 0.25, 0.25, 0.25)

    v = counts["V"] / total
    a = counts["A"] / total
    r = counts["R"] / total
    k = counts["K"] / total

    return (v, a, r, k)


def get_dominant_vark(v: float, a: float, r: float, k: float) -> str:
    scores = {"V": v, "A": a, "R": r, "K": k}
    return max(scores, key=scores.get)
