"""Server-side Groq integration and SoulGuru safety/persona instructions."""

from __future__ import annotations

import logging
import os

import httpx
from fastapi import HTTPException

logger = logging.getLogger("soulspace.soulguru")
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b"
SYSTEM_INSTRUCTION = """You are SoulGuru, the calm spiritual companion of SOULSPACE.

Your purpose is to help people slow down, reflect, become aware of their thoughts and emotions, and find more inner peace. Speak like a wise and compassionate meditation teacher with a calm, gentle presence. Be peaceful, warm, concise, thoughtful, compassionate, human, and never judgmental or preachy. Do not overwhelm the user with long lectures. Prefer short paragraphs and practical reflections.

When appropriate, encourage a slow breath, suggest a grounding exercise, offer a reflective thought, ask one meaningful question, or suggest one practical next step. Do not pretend to know exactly what the user is feeling. Do not make supernatural claims, claim spiritual powers, or manipulate the user emotionally. Respect all religions and non-religious perspectives. For spiritual or philosophical questions, provide balanced perspectives rather than claiming one belief is universally true. For practical help, combine reflection with realistic actions.

If the user expresses serious emotional distress, self-harm, suicidal thoughts, or immediate danger, respond compassionately and encourage contacting a trusted person, qualified professionals, or appropriate emergency/crisis support. Do not suggest meditation alone can solve a crisis. Never shame the user. You are SoulGuru — a gentle guide, not an authority."""


async def generate_reply(messages: list[dict[str, str]]) -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        logger.error("GROQ_API_KEY is not configured.")
        raise HTTPException(status_code=503, detail="Your guide is taking a quiet moment. Please try again in a little while.")

    model = os.getenv("GROQ_MODEL", DEFAULT_GROQ_MODEL).strip() or DEFAULT_GROQ_MODEL
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(35.0, connect=5.0)) as client:
            response = await client.post(
                GROQ_CHAT_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": model,
                    "messages": [{"role": "system", "content": SYSTEM_INSTRUCTION}, *messages],
                    "max_completion_tokens": 600,
                    "temperature": 0.7,
                },
            )
    except httpx.TimeoutException:
        logger.warning("Groq request timed out.")
        raise HTTPException(status_code=504, detail="Your guide is taking a quiet moment. Please try again in a little while.") from None
    except httpx.HTTPError as error:
        logger.warning("Groq request failed (%s).", type(error).__name__)
        raise HTTPException(status_code=503, detail="Your guide is taking a quiet moment. Please try again in a little while.") from None

    if response.status_code == 429:
        logger.warning("Groq rate limit reached.")
        raise HTTPException(status_code=429, detail="Your guide is taking a quiet moment. Please try again in a little while.")
    if response.status_code in {401, 403}:
        logger.error("Groq rejected the configured credentials (HTTP %s).", response.status_code)
        raise HTTPException(status_code=503, detail="SoulGuru is temporarily unavailable. Please try again later.")
    if response.is_error:
        logger.warning("Groq returned HTTP %s.", response.status_code)
        raise HTTPException(status_code=503, detail="Your guide is taking a quiet moment. Please try again in a little while.")
    try:
        payload = response.json()
        answer = payload["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError):
        logger.warning("Groq returned an unexpected completion payload.")
        raise HTTPException(status_code=503, detail="Your guide is taking a quiet moment. Please try again in a little while.") from None
    if not isinstance(answer, str) or not answer.strip():
        raise HTTPException(status_code=503, detail="Your guide is taking a quiet moment. Please try again in a little while.")
    return answer.strip()[:12_000]
