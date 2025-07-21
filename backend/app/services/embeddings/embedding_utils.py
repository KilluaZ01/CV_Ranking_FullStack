from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str) -> np.ndarray:
    return model.encode(text)

def compute_similarity(text1: str, text2: str) -> float:
    vec1 = embed_text(text1).reshape(1, -1)
    vec2 = embed_text(text2).reshape(1, -1)
    return float(cosine_similarity(vec1, vec2)[0][0])