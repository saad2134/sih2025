"""Add search_vector to courses

Revision ID: 003_add_search_vector
Revises: 002_subscription
Create Date: 2026-05-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '003_add_search_vector'
down_revision: Union[str, None] = '002_subscription'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('courses', sa.Column('search_vector', postgresql.TSVECTOR(), nullable=True))


def downgrade() -> None:
    op.drop_column('courses', 'search_vector')
