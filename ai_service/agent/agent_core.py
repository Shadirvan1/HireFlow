import inspect
from .select_tool import ask_llm_tool
from .tool_registry import tools
from services.chat_service import ask_general_llm


async def run_agent(message: str):

    try:
        # 1️⃣ Decide which tool to use
        decision = await ask_llm_tool(message)

        if not decision:
            answer = await ask_general_llm(message)
            return {"type": "text", "data": answer}

        tool_name = decision.get("tool")
        params = decision.get("params", {}) or {}

        # 2️⃣ If no tool selected → normal LLM response
        if tool_name == "none" or not tool_name:
            answer = await ask_general_llm(message)
            return {
                "type": "text",
                "data": answer
            }

        # 3️⃣ Check tool exists
        tool_data = tools.get(tool_name)

        if not tool_data:
            return {
                "type": "text",
                "data": f"The tool '{tool_name}' is not available."
            }

        tool_function = tool_data["function"]


        if inspect.iscoroutinefunction(tool_function):
            result = await tool_function(**params)
        else:
            result = tool_function(**params)

        return {
            "type": "tool_result",
            "tool_used": tool_name,
            "data": result
        }

    except Exception as e:
        return {
            "type": "error",
            "data": "An unexpected error occurred while processing the request."
        }