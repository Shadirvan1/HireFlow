from graph_agent.tools import fetch_job_data, normalize_scores, evaluate_candidate, decision_guard
from schemas.langgraph import HiringState
from langgraph.graph import StateGraph, END



builder = StateGraph(HiringState)

builder.add_node("fetch_job", fetch_job_data)
builder.add_node("normalize", normalize_scores)
builder.add_node("evaluate", evaluate_candidate)
builder.add_node("guard", decision_guard)

builder.set_entry_point("fetch_job")

builder.add_edge("fetch_job", "normalize")
builder.add_edge("normalize", "evaluate")
builder.add_edge("evaluate", "guard")
builder.add_edge("guard", END)

graph = builder.compile()


def run_graph_agent(application_id: int, job_embedd_id: int, scores: dict):
    initial_state = HiringState(
        application_id=str(application_id),
        job_embedd_id=str(job_embedd_id),
        scores=scores
    )

    result = graph.invoke(initial_state)
    return result
    

