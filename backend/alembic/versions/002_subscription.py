"""Add subscription_tier to users

Revision ID: 002_subscription
Revises: 001_initial
Create Date: 2026-05-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002_subscription'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('subscription_tier', sa.String(length=50), server_default='free', nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'subscription_tier')
