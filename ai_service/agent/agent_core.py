# import inspect
# from .select_tool import ask_llm_tool
# from .tool_registry import tools
# from services.chat_service import ask_general_llm


# async def run_agent(message: str):

#     try:
#         # 1️⃣ Decide which tool to use
#         decision = await ask_llm_tool(message)

#         if not decision:
#             answer = await ask_general_llm(message)
#             return {"type": "text", "data": answer}

#         tool_name = decision.get("tool")
#         params = decision.get("params", {}) or {}

#         # 2️⃣ If no tool selected → normal LLM response
#         if tool_name == "none" or not tool_name:
#             answer = await ask_general_llm(message)
#             return {
#                 "type": "text",
#                 "data": answer
#             }

#         # 3️⃣ Check tool exists
#         tool_data = tools.get(tool_name)

#         if not tool_data:
#             return {
#                 "type": "text",
#                 "data": f"The tool '{tool_name}' is not available."
#             }

#         tool_function = tool_data["function"]


#         if inspect.iscoroutinefunction(tool_function):
#             result = await tool_function(**params)
#         else:
#             result = tool_function(**params)

#         return {
#             "type": "tool_result",
#             "tool_used": tool_name,
#             "data": result
#         }

#     except Exception as e:
#         return {
#             "type": "error",
#             "data": "An unexpected error occurred while processing the request."
#         }from langgraph.prebuilt import create_react_agent
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from .tools import search_jobs, search_candidates
import os
import time

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY2")
)

tools = [search_jobs, search_candidates]

agent_executor = create_react_agent(llm, tools)

# global request counter
request_count = 0
window_start = time.time()

MAX_REQUESTS = 60
WINDOW_SECONDS = 60


async def run_agent(message: str):
    global request_count, window_start

    try:
        now = time.time()

        # reset time window
        if now - window_start > WINDOW_SECONDS:
            request_count = 0
            window_start = now

        # check rate limit
        if request_count >= MAX_REQUESTS:
            return "Rate limit reached. Please wait a minute before sending more requests."

        request_count += 1

        inputs = {"messages": [("human", message)]}

        result = await agent_executor.ainvoke(inputs)

        final_message = result["messages"][-1]

        return final_message.content

    except Exception as e:
        print(f"Agent Error: {e}")
        return "I'm sorry, I couldn't complete that request."