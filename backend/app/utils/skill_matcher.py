from sentence_transformers import SentenceTransformer, util
from rapidfuzz import fuzz

# Load a pre-trained sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

def fuzzy_match(a: str, b: str, threshold: int = 85) -> bool:
    return fuzz.ratio(a.lower(), b.lower()) >= threshold

def semantic_match(a: str, b: str, threshold: float = 0.75) -> bool:
    emb1 = model.encode(a, convert_to_tensor=True)
    emb2 = model.encode(b, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(emb1, emb2).item()
    return similarity >= threshold

def is_keyword_match(a: str, b: str) -> bool:
    return fuzzy_match(a, b) or semantic_match(a, b)

def match_skills(jd_skills: list[str], cv_skills: list[str]) -> dict:
    matches = []
    for jd_skill in jd_skills:
        for cv_skill in cv_skills:
            if is_keyword_match(jd_skill, cv_skill):
                matches.append(jd_skill)
                break  # Move to next JD skill once matched
    return {
        "matched": matches,
        "unmatched": [s for s in jd_skills if s not in matches],
        "score": len(matches) / len(jd_skills) if jd_skills else 0
    }
