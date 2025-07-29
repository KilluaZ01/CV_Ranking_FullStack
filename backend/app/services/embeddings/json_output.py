from app.services.embeddings.evaluate_cv import evaluate_cv
from app.utils.skill_matcher import match_skills

def generate_scored_output(jd_cleaned, cvs_cleaned, weights=None):
    if weights is None:
        weights = {
            "skills": 0.4,
            "experience": 0.4,
            "education": 0.2
        }

    output = []

    for cv in cvs_cleaned:
        result = evaluate_cv(jd_cleaned, cv)
        s = result["similarities"]

        total_score = (
            weights["skills"] * s["skills"] +
            weights["experience"] * s["experience"] +
            weights["education"] * s["education"]
        )

        result["total_score"] = round(total_score, 3)
        output.append(result)

    return output