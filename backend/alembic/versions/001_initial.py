"""Initial schema with users, courses, learner_profiles

Revision ID: 001_initial
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('password_hash', sa.Text, nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('timezone', sa.String(100), server_default='Asia/Kolkata'),
        sa.Column('preferred_language', sa.String(10), server_default='en'),
        sa.Column('onboarding_done', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_active_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    op.create_table(
        'courses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('provider', sa.String(255), nullable=False),
        sa.Column('url', sa.Text, nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('nsqf_level', sa.Integer, server_default='0'),
        sa.Column('nsqf_sector', sa.String(100), nullable=True),
        sa.Column('style_tags', postgresql.ARRAY(sa.String), server_default='{}'),
        sa.Column('math_depth', sa.Integer, server_default='1'),
        sa.Column('math_topics', postgresql.ARRAY(sa.String), server_default='{}'),
        sa.Column('vark_v_score', sa.Float, server_default='0.25'),
        sa.Column('vark_a_score', sa.Float, server_default='0.25'),
        sa.Column('vark_r_score', sa.Float, server_default='0.25'),
        sa.Column('vark_k_score', sa.Float, server_default='0.25'),
        sa.Column('vark_vector', postgresql.ARRAY(sa.Float), nullable=True),
        sa.Column('hours_per_week', sa.Float, server_default='0'),
        sa.Column('total_hours', sa.Float, server_default='0'),
        sa.Column('completion_rate', sa.Float, server_default='0'),
        sa.Column('avg_rating', sa.Float, server_default='0'),
        sa.Column('review_count', sa.Integer, server_default='0'),
        sa.Column('difficulty', sa.String(50), server_default='beginner'),
        sa.Column('language', sa.String(10), server_default='en'),
        sa.Column('sector', sa.String(100), nullable=True),
        sa.Column('week_breakdown', postgresql.JSON, nullable=True),
        sa.Column('prerequisites', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('job_roles', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('llm_tagged', sa.Boolean, server_default='false'),
        sa.Column('last_scraped_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('provider', 'url'),
    )
    
    op.create_table(
        'learner_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('vark_v', sa.Float, server_default='0.0'),
        sa.Column('vark_a', sa.Float, server_default='0.0'),
        sa.Column('vark_r', sa.Float, server_default='0.0'),
        sa.Column('vark_k', sa.Float, server_default='0.0'),
        sa.Column('dominant_vark', sa.String(1), nullable=True),
        sa.Column('vark_cluster', sa.Integer, nullable=True),
        sa.Column('topic', sa.String(255), nullable=False),
        sa.Column('goal', sa.String(50), nullable=False),
        sa.Column('hours_per_week', sa.Integer, nullable=False),
        sa.Column('math_comfort', sa.Integer, server_default='3'),
        sa.Column('style_preferences', postgresql.ARRAY(sa.String), server_default='{}'),
        sa.Column('prior_knowledge', sa.String(50), server_default='none'),
        sa.Column('career_target', sa.String(255), nullable=True),
        sa.Column('language', sa.String(10), server_default='en'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    op.create_table(
        'recommendation_jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('learner_profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('learner_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('results', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=True),
        sa.Column('error', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    op.create_table(
        'enrolments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_week', sa.Integer, server_default='0'),
        sa.Column('progress_pct', sa.Float, server_default='0'),
        sa.Column('dropped', sa.Boolean, server_default='false'),
        sa.Column('dropped_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    op.create_table(
        'reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rating', sa.Integer, nullable=False),
        sa.Column('body', sa.Text, nullable=False),
        sa.Column('completion_status', sa.String(50), nullable=False),
        sa.Column('vark_cluster', sa.Integer, nullable=True),
        sa.Column('vark_type', sa.String(1), nullable=True),
        sa.Column('what_surprised_you', sa.Text, nullable=True),
        sa.Column('reviewer_type', sa.String(20), server_default='user'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    op.create_index('ix_courses_nsqf_level', 'courses', ['nsqf_level'])
    op.create_index('ix_courses_math_depth', 'courses', ['math_depth'])
    op.create_index('ix_courses_difficulty', 'courses', ['difficulty'])


def downgrade() -> None:
    op.drop_table('reviews')
    op.drop_table('enrolments')
    op.drop_table('recommendation_jobs')
    op.drop_table('learner_profiles')
    op.drop_table('courses')
    op.drop_table('users')