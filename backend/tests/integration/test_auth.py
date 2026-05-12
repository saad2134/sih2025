"""Integration tests for auth endpoints."""

import pytest
from httpx import AsyncClient


class TestAuthRegister:
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/register", json={
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User",
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, auth_token):
        response = await client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "anotherpassword",
            "full_name": "Duplicate User",
        })
        
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/register", json={
            "email": "not-an-email",
            "password": "password123",
            "full_name": "Test",
        })
        
        assert response.status_code == 422


class TestAuthLogin:
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, auth_token):
        response = await client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "testpassword123",
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data["data"]

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, auth_token):
        response = await client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password123",
        })
        
        assert response.status_code == 401


class TestAuthMe:
    @pytest.mark.asyncio
    async def test_get_me(self, client: AsyncClient, auth_token: str):
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["email"] == "test@example.com"
        assert data["data"]["full_name"] == "Test User"