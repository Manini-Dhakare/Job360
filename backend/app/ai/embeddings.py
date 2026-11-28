"""
PyTorch Bi-Encoder Dense Vector Embeddings Engine (BAAI/bge-large-en-v1.5)
100% Free & Open-Source local inference with in-memory vector caching and lexical fallback.
"""
import hashlib
import math
import re
from collections import Counter
from typing import Dict, List, Optional

from app.core.config import settings
from app.core.logging import logger


class BiEncoderEmbeddingEngine:
    """PyTorch SentenceTransformer embeddings with lazy loading and LRU-style vector cache."""

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self._model = None
        self._torch_available: Optional[bool] = None
        self._vec_cache: Dict[str, List[float]] = {}

    def _load_model(self) -> bool:
        if self._torch_available is not None:
            return self._torch_available
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name, device=settings.TORCH_DEVICE)
            self._torch_available = True
            logger.info(f"Loaded PyTorch embedding model: {self.model_name}")
        except Exception as exc:
            self._torch_available = False
            logger.warning(f"PyTorch/SentenceTransformer unavailable, using lexical cosine fallback: {exc}")
        return self._torch_available

    @property
    def is_neural(self) -> bool:
        return self._load_model()

    def _get_cached_or_encode(self, text: str) -> Optional[List[float]]:
        snippet = text[:1500]
        key = hashlib.md5(snippet.encode("utf-8")).hexdigest()
        if key in self._vec_cache:
            return self._vec_cache[key]
        if self._load_model() and self._model is not None:
            vec = self._model.encode([snippet], normalize_embeddings=True)[0].tolist()
            if len(self._vec_cache) > 1000:
                self._vec_cache.clear()
            self._vec_cache[key] = vec
            return vec
        return None

    def encode(self, texts: List[str]) -> List[List[float]]:
        """Generate normalized dense vector embeddings using PyTorch."""
        if not texts:
            return []
        if self._load_model() and self._model is not None:
            vectors = self._model.encode(texts, normalize_embeddings=True)
            return [v.tolist() for v in vectors]
        return []

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))

    @staticmethod
    def lexical_cosine(text_a: str, text_b: str) -> float:
        """Zero-dependency TF cosine similarity fallback when torch is not installed."""
        tokens_a = Counter(re.findall(r"[a-z0-9+#.]{2,}", text_a.lower()))
        tokens_b = Counter(re.findall(r"[a-z0-9+#.]{2,}", text_b.lower()))
        if not tokens_a or not tokens_b:
            return 0.0
        common = set(tokens_a.keys()) & set(tokens_b.keys())
        dot = sum(tokens_a[t] * tokens_b[t] for t in common)
        norm_a = math.sqrt(sum(v * v for v in tokens_a.values()))
        norm_b = math.sqrt(sum(v * v for v in tokens_b.values()))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))

    def semantic_similarity(self, text_a: str, text_b: str) -> float:
        """Compute semantic similarity [0.0, 1.0] using cached PyTorch embeddings or fallback."""
        if not text_a.strip() or not text_b.strip():
            return 0.0
        if self._load_model():
            vec_a = self._get_cached_or_encode(text_a)
            vec_b = self._get_cached_or_encode(text_b)
            if vec_a and vec_b:
                return self.cosine_similarity(vec_a, vec_b)
        return self.lexical_cosine(text_a, text_b)


embedding_engine = BiEncoderEmbeddingEngine()
