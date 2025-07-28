from app.services.embeddings.embedding_utils import compute_similarity
from datetime import datetime

# ---------- Normalizers ----------

def normalize_education_level(text):
    text = text.lower()
    if "bachelor" in text or "b.sc" in text or "bachelors" in text:
        return "bachelor"
    if "master" in text or "m.sc" in text or "msc" in text:
        return "master"
    if "phd" in text or "doctorate" in text:
        return "phd"
    return text

def normalize_title(title):
    synonyms = {
        "software developer": "software engineer",
        "backend dev": "software engineer",
        "data scientist": "data analyst",
        "bsc": "bachelor",
        "msc": "master",
        "cto": "chief technology officer"
    }
    title = title.lower()
    return synonyms.get(title, title)

def normalize_field(field):
    # Lowercase and remove extra spaces, you can add more normalization if needed
    return field.lower().strip()

# ---------- Helper functions ----------

def is_relevant_field(cv_field, jd_fields):
    """Check if cv_field is relevant to any jd_field (case-insensitive substring match)"""
    cv_field_norm = normalize_field(cv_field)
    for jd_field in jd_fields:
        jd_field_norm = normalize_field(jd_field)
        if jd_field_norm in cv_field_norm or cv_field_norm in jd_field_norm:
            return True
    return False

def list_similarity(list1, list2):
    set1, set2 = set(map(str.lower, list1)), set(map(str.lower, list2))
    if not set1 or not set2:
        return 0.0
    return len(set1 & set2) / len(set1 | set2)

def recency_boost(start_year):
    now = datetime.now().year
    delta = now - start_year
    return max(1.0 - (delta / 10.0), 0.0)

def experience_score(cv_roles, jd_title, jd_skills, jd_industry):
    now = datetime.now().year
    best_score = 0

    for role in cv_roles:
        role_title = normalize_title(role.get("title", ""))
        role_industry = role.get("industry", "")
        role_skills = role.get("skills", [])
        start_year = role.get("start_year", now - 1)

        title_score = compute_similarity(role_title, jd_title)
        industry_score = compute_similarity(role_industry, jd_industry or "")
        skills_score = list_similarity(role_skills, jd_skills)
        years_exp = now - start_year
        exp_score = min(years_exp / 5.0, 1.0)
        recent_bonus = recency_boost(start_year)

        total = (
            0.4 * title_score +
            0.2 * industry_score +
            0.2 * skills_score +
            0.1 * exp_score +
            0.1 * recent_bonus
        )

        best_score = max(best_score, total)

    return round(best_score, 2)

# ---------- Education evaluation ----------

def evaluate_education(jd_education, cv_education_list):
    """
    jd_education: dict with keys 'degree_levels' (list) and 'fields' (list)
    cv_education_list: list of dicts with keys 'degree_level' and 'field'
    """
    jd_levels = jd_education.get("degree_levels", [])
    jd_levels = [normalize_education_level(lvl) for lvl in jd_levels]

    jd_fields = jd_education.get("fields", [])
    jd_fields = [normalize_field(fld) for fld in jd_fields]

    best_score = 0
    for edu in cv_education_list:
        cv_level = normalize_education_level(edu.get("degree_level", ""))
        cv_field = edu.get("field", "")

        level_match = cv_level in jd_levels
        field_match = is_relevant_field(cv_field, jd_fields)

        if level_match and field_match:
            score = 1.0
        elif level_match and not field_match:
            score = 0.5
        else:
            score = 0.0

        best_score = max(best_score, score)

    return best_score

# ---------- Semantic skill score ----------

def semantic_skill_score(jd_skills, cv_skills):
    if not jd_skills or not cv_skills:
        return 0.0

    jd_skills = list(set(map(str.lower, jd_skills)))
    cv_skills = list(set(map(str.lower, cv_skills)))

    total = 0.0
    for jd_skill in jd_skills:
        best_match = 0.0
        for cv_skill in cv_skills:
            sim = compute_similarity(jd_skill, cv_skill)
            if sim > best_match:
                best_match = sim
        total += best_match

    return total / len(jd_skills)

# ---------- Main evaluation function ----------

def evaluate_cv(jd_cleaned, cv):
    jd_title = normalize_title(jd_cleaned.get("title", ""))
    jd_skills = jd_cleaned.get("skills", [])
    jd_education = jd_cleaned.get("education", {})
    jd_industry = jd_cleaned.get("industry", "")

    cv_skills = cv.get("skills", [])
    cv_education_list = cv.get("education", [])
    cv_experience = cv.get("experience", [])

    education_score = evaluate_education(jd_education, cv_education_list)
    return {
        "name": cv.get("name", "Unnamed"),
        "similarities": {
            "skills": round(semantic_skill_score(jd_skills, cv_skills), 2),
            "experience": experience_score(cv_experience, jd_title, jd_skills, jd_industry),
            "education": round(education_score, 2)
        }
    }
def semantic_skill_score(jd_skills, cv_skills):
    if not jd_skills or not cv_skills:
        return 0.0

    jd_skills = list(set(map(str.lower, jd_skills)))
    cv_skills = list(set(map(str.lower, cv_skills)))

    total = 0.0
    for jd_skill in jd_skills:
        best_match = 0.0
        for cv_skill in cv_skills:
            sim = compute_similarity(jd_skill, cv_skill)
            if sim > best_match:
                best_match = sim
        total += best_match

    return total / len(jd_skills)
