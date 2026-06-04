"""Add user_settings JSONB column to users

Revision ID: 006_add_user_settings
Revises: 5c23d7513cf1
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision: str = '006_add_user_settings'
down_revision: Union[str, None] = '14dc7cf10a5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('user_settings', JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'user_settings')
