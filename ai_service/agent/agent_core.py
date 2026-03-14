import os
import time
import asyncio
from typing import Optional, Dict, List
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from .tools import search_jobs, search_candidates, general_support


# --- TOOLS ---
tools = [search_jobs, search_candidates, general_support]


# --- Tier 1: Groq Primary ---
llm1 = ChatGroq(
    model="llama-3.3-70b-versatile", 
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY")
)
llm2 = ChatGroq(
    model="llama-3.3-70b-versatile", 
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY2")
)

# --- Tier 2: Groq Backup (Use 3.1 instead of decommissioned Llama 3) ---
llm3 = ChatGroq(
    model="llama-3.1-8b-instant", # Using the 8b version is better for backup as it has higher limits
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY")
)
llm4 = ChatGroq(
    model="llama-3.1-8b-instant", # Using the 8b version is better for backup as it has higher limits
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY2")
)



LLMS = [llm1, llm2, llm3, llm4]


# --- FALLBACK EXECUTION ---
async def call_llm_with_fallback(messages):
    last_error = None

    for llm in LLMS:
        try:
            agent = create_react_agent(llm, tools)

            result = await agent.ainvoke(
                {"messages": messages},
                config={"recursion_limit": 5}
            )
            print(result)
            return result

        except Exception as e:
            print(f"LLM failed: {llm} -> {e}")
            last_error = e
            continue

    raise last_error


# --- CONCURRENCY ---
global_semaphore = asyncio.Semaphore(2)

# --- RATE LIMIT ---
user_request_history: Dict[str, List[float]] = {}
USER_MAX_REQUESTS = 5
USER_WINDOW_SECONDS = 60


async def run_agent(
    message: str,
    user_id: str,
    company_id: Optional[str] = None,
    company_name: Optional[str] = None
):

    async with global_semaphore:
        try:
            now = time.time()

            if user_id not in user_request_history:
                user_request_history[user_id] = []

            user_request_history[user_id] = [
                t for t in user_request_history[user_id]
                if now - t < USER_WINDOW_SECONDS
            ]

            if len(user_request_history[user_id]) >= USER_MAX_REQUESTS:
                return f"Rate limit reached. Please wait {USER_WINDOW_SECONDS} seconds."

            user_request_history[user_id].append(now)

            # --- SYSTEM MESSAGE ---
            if company_id and company_name:
                system_message = (
                    "CRITICAL: If the user is just saying hi or hello, do NOT use any tools. "
                    f"You are the recruitment assistant for {company_name}. "
                    f"MANDATORY: Use company_id='{company_id}' for all search tools."
                )
            else:
                system_message = (
                    "You are a recruitment assistant for candidates. "
                    "CRITICAL: If the user is just saying hi or hello, do NOT use any tools. "
                    "Only use 'search_jobs' if they ask for specific job listings. "
                    "You are strictly FORBIDDEN from using 'search_candidates'."
                )

            # --- AGENT EXECUTION ---
            result = await call_llm_with_fallback(
                [("system", system_message), ("human", message)]
            )
            print(result["messages"][-1].content)
            for msg in reversed(result["messages"]):
                if hasattr(msg, "content") and msg.content:
                    if not msg.additional_kwargs.get("tool_calls"):
                        return msg.content
            return "Sorry, I couldn't generate a response."

        except Exception as e:
            print(f"Critical System Failure: {e}")
            return "All AI systems are currently overloaded. Please try again in 10 minutes."