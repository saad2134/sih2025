"""FAISS index rebuild task - serializes to disk for cold-start recovery."""

import os
import pickle
from sqlalchemy import select
import faiss
import numpy as np

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.course import Course


INDEX_PATH = os.environ.get("FAISS_INDEX_PATH", "/tmp/courses.index")
META_PATH = os.environ.get("FAISS_META_PATH", "/tmp/courses_meta.pkl")


@celery_app.task(name="app.tasks.faiss_rebuild.rebuild_faiss_index")
def rebuild_faiss_index():
    """
    Daily: Rebuild FAISS index and serialize to disk.
    FAISS index builds from course embeddings. Activates at 50+ enrolments.
    """
    try:
        with get_db_context() as db:
            result = db.execute(
                select(Course).where(
                    Course.llm_tagged == True,
                    Course.vark_v_score.isnot(None)
                )
            )
            courses = result.scalars().all()

            if len(courses) < 50:
                return {
                    "status": "skipped",
                    "reason": "Fewer than 50 tagged courses",
                    "count": len(courses)
                }

            vectors = np.array([
                [c.vark_v_score, c.vark_a_score, c.vark_r_score, c.vark_k_score]
                for c in courses
            ], dtype=np.float32)

            if len(vectors) == 0:
                return {"status": "empty"}

            faiss.normalize_L2(vectors)
            
            dim = vectors.shape[1]
            index = faiss.IndexFlatIP(dim)
            index.add(vectors)
            
            faiss.write_index(index, INDEX_PATH)
            
            metadata = {
                "course_ids": [str(c.id) for c in courses],
                "count": len(courses),
            }
            with open(META_PATH, "wb") as f:
                pickle.dump(metadata, f)

            return {
                "status": "success",
                "courses_indexed": len(courses),
                "index_path": INDEX_PATH
            }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@celery_app.task(name="app.tasks.faiss_rebuild.load_faiss_index")
def load_faiss_index():
    """Load FAISS index from disk on startup."""
    try:
        if not os.path.exists(INDEX_PATH):
            return {"status": "no_index", "message": "Index file not found"}
        
        index = faiss.read_index(INDEX_PATH)
        
        metadata = {}
        if os.path.exists(META_PATH):
            with open(META_PATH, "rb") as f:
                metadata = pickle.load(f)

        return {
            "status": "loaded",
            "vectors": index.ntotal,
            "metadata": metadata
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}