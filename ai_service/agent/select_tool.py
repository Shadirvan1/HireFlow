import os
import json
from groq import Groq
from .tool_registry import tools

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def ask_llm_tool(message: str):

    tool_list = "\n".join([
        f"{name}: {tool['description']}"
        for name, tool in tools.items()
    ])

    prompt = f"""
You are an AI Hiring Assistant responsible for routing user requests.

Available Tools:
{tool_list}

Instructions:
1. If the user's request clearly matches one of the available tools, return the tool name and parameters.
2. If the request does NOT match any available tool (for example greetings, unrelated questions, or unsupported features), return:
   - tool: "none"
   - a helpful message explaining that this feature is not currently supported.

Response Format (STRICT JSON ONLY):
{{
  "tool": "tool_name_or_none",
  "params": {{
    "query": "user request"
  }},
  "message": "Direct response if no tool is used"
}}

User Request: {message}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        content = response.choices[0].message.content.strip()

        data = json.loads(content)

        # If no valid tool selected
        if data.get("tool") == "none" or data.get("tool") not in tools:
            return {
                "type": "text",
                "data": data.get(
                    "message",
                    "Thank you for your request. Currently, this feature is not available in our system. Please try another query related to hiring, jobs, or candidates."
                )
            }

        return {
            "type": "tool",
            "tool": data["tool"],
            "params": data.get("params", {})
        }

    except Exception as e:
        return {
            "type": "text",
            "data": "Sorry, I couldn't process your request at the moment. Please try again later."
        }